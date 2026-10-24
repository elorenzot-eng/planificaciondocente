/**
 * Preliminary OMR classifier for one answer row after perspective correction.
 * Input values are darkness fractions (0 = blank paper, 1 = filled).
 * Returns review markers rather than guessing faint or multiple marks.
 */
import type { SimceMark } from "./simce-paper-grading";

export type BubbleDarkness = readonly [number, number, number, number];
export type OmrReading = { mark: SimceMark; confidence: number; darkness: BubbleDarkness };
const OPTIONS = ["A", "B", "C", "D"] as const;
export function classifyBubbleRow(
  darkness: BubbleDarkness,
  settings: { minFill?: number; ambiguityGap?: number } = {}
): OmrReading {
  const minFill = settings.minFill ?? 0.32;
  const ambiguityGap = settings.ambiguityGap ?? 0.13;
  if (!darkness.every(x => Number.isFinite(x) && x >= 0 && x <= 1)) throw new Error("Mediciones OMR inválidas");
  if (minFill <= 0 || minFill >= 1 || ambiguityGap < 0 || ambiguityGap >= 1) throw new Error("Umbrales OMR inválidos");
  const ranked = darkness.map((value, index) => ({value,index})).sort((a,b) => b.value-a.value);
  const [first,second] = ranked;
  if (first.value < minFill * 0.6) return {mark:null,confidence:1-first.value,darkness};
  if (first.value < minFill) return {mark:"UNCERTAIN",confidence:0,darkness};
  if (second.value >= minFill) return {mark:"MULTIPLE",confidence:0,darkness};
  if (first.value-second.value < ambiguityGap) return {mark:"UNCERTAIN",confidence:0,darkness};
  return {mark:OPTIONS[first.index],confidence:Math.min(1,(first.value-second.value)/Math.max(ambiguityGap,0.01)),darkness};
}

/** Fraction of dark pixels inside a bubble interior, excluding the printed outline. */
export function measureBubble(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
  cutoff = 125
): number {
  if (!Number.isInteger(width) || !Number.isInteger(height) || rgba.length !== width*height*4 || radius < 3) throw new Error("Imagen OMR inválida");
  let count=0, dark=0;
  const inner=radius*0.68;
  for (let y=Math.max(0,Math.floor(cy-inner));y<Math.min(height,Math.ceil(cy+inner));y++) {
    for (let x=Math.max(0,Math.floor(cx-inner));x<Math.min(width,Math.ceil(cx+inner));x++) {
      if ((x-cx)**2+(y-cy)**2>inner**2) continue;
      const i=(y*width+x)*4;
      const luminance=0.2126*rgba[i]+0.7152*rgba[i+1]+0.0722*rgba[i+2];
      if (luminance<cutoff) dark++;
      count++;
    }
  }
  if (!count) throw new Error("Burbuja fuera de imagen");
  return dark/count;
}
