import { classifyBubbleRow, measureBubble, type BubbleDarkness } from "./simce-paper-omr";
import type { SimceAnswer } from "./simce-paper-grading";

/**
 * Reads a calibrated, front-facing answer sheet image. Geometry must be
 * established separately; do not use on unrectified camera photographs.
 */
export type BubblePosition = { x: number; y: number; radius: number };
export type AnswerRowGeometry = {
  number: number;
  bubbles: readonly [BubblePosition, BubblePosition, BubblePosition, BubblePosition];
};
export type Raster = { data: Uint8ClampedArray; width: number; height: number };
export type OmrSheetResult = {
  answers: SimceAnswer[];
  reviewNumbers: number[];
  measurements: { number: number; darkness: BubbleDarkness; confidence: number }[];
};
export function readCalibratedSheet(
  raster: Raster,
  rows: readonly AnswerRowGeometry[],
  options: { cutoff?: number; minFill?: number; ambiguityGap?: number } = {}
): OmrSheetResult {
  if (!rows.length || rows.length > 100 || new Set(rows.map(r => r.number)).size !== rows.length)
    throw new Error("Geometría de hoja inválida");
  const answers: SimceAnswer[] = [];
  const reviewNumbers: number[] = [];
  const measurements: OmrSheetResult["measurements"] = [];
  for (const row of rows) {
    if (!Number.isInteger(row.number) || row.number < 1 || row.bubbles.length !== 4)
      throw new Error("Fila OMR inválida");
    const darkness = row.bubbles.map(b => {
      if (![b.x,b.y,b.radius].every(Number.isFinite) || b.x-b.radius < 0 || b.y-b.radius < 0 ||
          b.x+b.radius >= raster.width || b.y+b.radius >= raster.height)
        throw new Error("Burbuja fuera de los límites: requiere recalibración");
      return measureBubble(raster.data,raster.width,raster.height,b.x,b.y,b.radius,options.cutoff);
    }) as unknown as BubbleDarkness;
    const reading = classifyBubbleRow(darkness,options);
    answers.push({number:row.number,mark:reading.mark});
    measurements.push({number:row.number,darkness,confidence:reading.confidence});
    if (reading.mark === "UNCERTAIN" || reading.mark === "MULTIPLE") reviewNumbers.push(row.number);
  }
  return {answers,reviewNumbers,measurements};
}
