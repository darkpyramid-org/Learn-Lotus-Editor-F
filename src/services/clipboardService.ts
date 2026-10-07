import { GlyphNode, GlyphTransform } from "@/types/editor";
import { GLYPH_IDS } from "@/data/glyphs";
import { buildExportSVG, SvgContentMap } from "./svgBuilder";
import { loadGlyph } from "./optimizedGlyphLoader";

export type CopySize = "small" | "large" | "wysiwyg";

export async function copyToClipboard(
  nodes: GlyphNode[],
  size: CopySize,
  quadratSize: number
): Promise<void> {
  if (nodes.length === 0) return;

  // Fetch all necessary SVGs first (deduplicated by glyph id)
  const svgMap: SvgContentMap = {};
  const uniqueIds = [...new Set(nodes.map((n) => n.glyphId))];
  await Promise.all(
    uniqueIds.map(async (glyphId) => {
      const data = await loadGlyph(glyphId);
      svgMap[glyphId] = {
        content: data.content,
        width: data.width,
        height: data.height,
      };
    })
  );

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
  transform: GlyphTransform;
}

const IDENTITY_TRANSFORM: GlyphTransform = { rotate: 0, scale: 1, flipX: false, flipY: false };

function isValidGlyphId(id: unknown): id is string {
  return typeof id === "string" && GLYPH_IDS.has(id);
}

function normalizeTransform(raw: any): GlyphTransform {
  const rotate = Number(raw?.rotate);
  const scale = Number(raw?.scale);
  return {
    rotate: Number.isFinite(rotate) ? rotate : 0,
    scale: Number.isFinite(scale) && scale > 0 ? scale : 1,
    flipX: raw?.flipX === true || raw?.flipx === true || raw?.flipx === "true",
    flipY: raw?.flipY === true || raw?.flipy === true || raw?.flipy === "true",
  };
}

function normalizeNode(raw: any): ParsedNode | null {
  if (!raw || !isValidGlyphId(raw.glyphId)) return null;
  return { glyphId: raw.glyphId, transform: normalizeTransform(raw.transform) };
}

/**
 * Reconstruct editor nodes from an SVG string produced by buildEditorSVG.
 * Prefers the embedded LOTUS_DATA JSON manifest; falls back to the
 * per-group data-* attributes on each <g>.
 */
export function parseSVGToNodes(svgString: string): ParsedNode[] {
  try {
    const doc = new DOMParser().parseFromString(svgString, "image/svg+xml");
    if (doc.querySelector("parsererror")) return [];

    // 1) JSON manifest comment
    const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_COMMENT);
    let comment: Comment | null;
    while ((comment = walker.nextNode() as Comment | null)) {
      const text = comment.nodeValue ?? "";
      if (text.startsWith("LOTUS_DATA:")) {
        try {
          const data = JSON.parse(text.slice("LOTUS_DATA:".length));
          if (Array.isArray(data)) {
            const nodes = data.map(normalizeNode).filter((n): n is ParsedNode => n !== null);
            if (nodes.length > 0) return nodes;
          }
        } catch {
          // fall through to attribute parsing
        }
      }
    }

    // 2) data attributes on <g> wrappers
    const groups = Array.from(doc.querySelectorAll("g[data-glyph-id]"));
    const nodes: ParsedNode[] = [];
    for (const g of groups) {
      const glyphId = g.getAttribute("data-glyph-id");
      if (!isValidGlyphId(glyphId)) continue;
      nodes.push({
        glyphId,
        transform: normalizeTransform({
          rotate: g.getAttribute("data-rotate"),
          scale: g.getAttribute("data-scale"),
          flipx: g.getAttribute("data-flipx"),
          flipy: g.getAttribute("data-flipy"),
        }),
      });
    }
    return nodes;
  } catch {
    return [];
  }
}

export function parsePlainTextToNodes(text: string): ParsedNode[] {
  return text
    .trim()
    .split(/\s+/)
    .filter((id) => GLYPH_IDS.has(id))
    .map((glyphId) => ({ glyphId, transform: { ...IDENTITY_TRANSFORM } }));
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
          const nodes = parseSVGToNodes(match[0]);
          if (nodes.length > 0) return nodes;
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
    // read() requires permission – fall back to readText()
  }
  try {
    const text = await navigator.clipboard.readText();
    return parsePlainTextToNodes(text);
  } catch {
    return [];
  }
}
