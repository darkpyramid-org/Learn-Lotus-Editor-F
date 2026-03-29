import { GlyphNode } from "@/types/editor";
import { GLYPH_IDS } from "@/data/glyphs";
import { buildExportSVG, SvgContentMap } from "./svgBuilder";
import { loadGlyph } from "./glyphLoader";

export type CopySize = "small" | "large" | "wysiwyg";

export async function copyToClipboard(
  nodes: GlyphNode[],
  size: CopySize,
  quadratSize: number
): Promise<void> {
  if (nodes.length === 0) return;

  // Fetch all necessary SVGs first
  const svgMap: SvgContentMap = {};
  const promises = nodes.map(async (node) => {
    if (!svgMap[node.glyphId]) {
      const data = await loadGlyph(node.glyphId);
      svgMap[node.glyphId] = {
        content: data.content,
        width: data.width,
        height: data.height,
      };
    }
  });
  await Promise.all(promises);

  const svgString = buildExportSVG(nodes, svgMap, size, quadratSize);
  const htmlString = `<!DOCTYPE html><html><body>${svgString}</body></html>`;
  const textString = nodes.map((n) => n.glyphId).join(" ");

  try {
    const data = [
      new ClipboardItem({
        "text/html": new Blob([htmlString], { type: "text/html" }),
        "text/plain": new Blob([textString], { type: "text/plain" }),
      }),
    ];
    await navigator.clipboard.write(data);
  } catch (err) {
    console.warn("Clipboard API failed, falling back to writeText", err);
    await navigator.clipboard.writeText(textString);
  }
}

export interface ParsedNode {
  glyphId: string;
  transform: { rotate: number; scale: number; flipX: boolean; flipY: boolean };
}

export function parseSVGToNodes(svgString: string): ParsedNode[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const groups = Array.from(doc.querySelectorAll("svg > g"));
    
    // We try to extract glyph IDs from the text content if it was saved there 
    // or just use common sense if we can't. 
    // For now, simple fallback:
    return groups.map(() => ({
      glyphId: "A1", // Default placeholder if we can't find ID
      transform: { rotate: 0, scale: 1, flipX: false, flipY: false },
    }));
  } catch {
    return [];
  }
}

export function parsePlainTextToNodes(text: string): ParsedNode[] {
  return text
    .trim()
    .split(/\s+/)
    .filter((id) => GLYPH_IDS.has(id))
    .map((glyphId) => ({
      glyphId,
      transform: { rotate: 0, scale: 1, flipX: false, flipY: false },
    }));
}

export async function pasteFromClipboard(): Promise<ParsedNode[]> {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (item.types.includes("text/html")) {
        const blob = await item.getType("text/html");
        const html = await blob.text();
        const match = html.match(/<svg[\s\S]*?<\/svg>/i);
        if (match) {
          // Attempt to find IDs in the plane text first if available
          // (Most apps bundle both)
        }
      }
      if (item.types.includes("text/plain")) {
        const blob = await item.getType("text/plain");
        const text = await blob.text();
        const nodes = parsePlainTextToNodes(text);
        if (nodes.length > 0) return nodes;
      }
    }
  } catch {
    try {
      const text = await navigator.clipboard.readText();
      return parsePlainTextToNodes(text);
    } catch {
      return [];
    }
  }
  return [];
}
