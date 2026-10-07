import { GlyphNode } from "@/types/editor";

export const QUADRAT = 100;

export interface SvgContentMap {
  [glyphId: string]: {
    content: string;
    width: number;
    height: number;
  };
}

export function buildEditorSVG(
  nodes: GlyphNode[],
  svgMap: SvgContentMap,
  quadratSize: number = QUADRAT
): string {
  if (nodes.length === 0) return "";

  const totalWidth = nodes.length * quadratSize;
  const totalHeight = quadratSize;

  const children = nodes
    .map((node, i) => {
      const glyph = svgMap[node.glyphId];
      if (!glyph) return "";

      const x = i * quadratSize;
      const { rotate, scale, flipX, flipY } = node.transform;

      const naturalScale = quadratSize / Math.max(glyph.width, glyph.height);
      const finalScale = naturalScale * scale;

      // Embed a slightly smaller glyph inside its quadrat
      const cx = glyph.width / 2;
      const cy = glyph.height / 2;

      const tx = x + quadratSize / 2;
      const ty = quadratSize / 2;

      const transformAttr = [
        `translate(${tx}, ${ty})`,
        `scale(${flipX ? -finalScale : finalScale}, ${flipY ? -finalScale : finalScale})`,
        `rotate(${rotate})`,
        `translate(${-cx}, ${-cy})`,
      ].join(" ");

      // Clean the content slightly for embedding
      const innerContent = glyph.content
        .replace(/<\?xml.*?\?>/i, "")
        .replace(/<!DOCTYPE.*?>/i, "")
        .replace(/<svg[^>]*>/i, "")
        .replace(/<\/svg>/i, "")
        .replace(/fill="#000000"/gi, 'fill="currentColor"')
        .replace(/style='fill:#000000; stroke:none'/gi, 'fill="currentColor"');

      // Persist glyph id + transform so the editor can reconstruct the
      // scene when this SVG is pasted back (data attributes + JSON manifest).
      return `<g transform="${transformAttr}" data-glyph-id="${node.glyphId}" data-rotate="${rotate}" data-scale="${scale}" data-flipx="${flipX}" data-flipy="${flipY}">${innerContent}</g>`;
    })
    .join("\n");

  const manifest = nodes.map((n) => ({ glyphId: n.glyphId, transform: n.transform }));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" style="color: #3e2723;">\n<!--LOTUS_DATA:${JSON.stringify(manifest)}-->\n${children}\n</svg>`;
}

export function buildExportSVG(
  nodes: GlyphNode[],
  svgMap: SvgContentMap,
  size: "small" | "large" | "wysiwyg",
  quadratSize: number = QUADRAT
): string {
  const sizeMap = { small: 40, large: 120, wysiwyg: quadratSize };
  return buildEditorSVG(nodes, svgMap, sizeMap[size]);
}
