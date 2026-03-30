/**
 * Shared utility for extracting and cleaning SVG content from raw strings.
 * Used by both GlyphNodeCard and GlyphLightbox for consistent rendering.
 */

export function extractInnerSVGContent(svgText: string): string {
  if (!svgText) return "";
  
  let content = svgText
    .replace(/<\?xml.*?\?>/i, "")
    .replace(/<!DOCTYPE.*?>/i, "")
    .replace(/<svg[^>]*>/i, "")
    .replace(/<\/svg>/i, "");
    
  // Normalize color placeholders for CSS currentColor injection
  content = content.replace(/fill\s*[:=]\s*["']?#000000["']?/gi, 'fill="currentColor"');
  content = content.replace(/stroke\s*[:=]\s*["']?#000000["']?/gi, 'stroke="currentColor"');
  
  return content;
}
