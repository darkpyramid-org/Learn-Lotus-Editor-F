export interface GlyphDef {
  id: string;
  label: string;
  category: string;
  svgContent: string;
  viewBox: string;
}

export interface GlyphTransform {
  rotate: number;
  scale: number;
  flipX: boolean;
  flipY: boolean;
}

export interface GlyphNode {
  instanceId: string;
  glyphId: string;
  transform: GlyphTransform;
}
