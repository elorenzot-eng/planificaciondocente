import type { AnswerRowGeometry, BubblePosition } from "./simce-paper-sheet-reader";

export type GridCalibration = {
  /** Pixel coordinates of the center of answer A in each of the two printed columns. */
  firstColumnA: { x: number; y: number };
  secondColumnA: { x: number; y: number };
  bubbleSpacing: number;
  rowSpacing: number;
  bubbleRadius: number;
  /** Number of answer rows in the left column; remaining rows are on the right. */
  leftRows: number;
};

/** Derive row centers from a measured, rectified two-column paper template. */
export function buildSimceGrid(
  totalQuestions: number,
  calibration: GridCalibration,
  imageWidth: number,
  imageHeight: number
): AnswerRowGeometry[] {
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1 || totalQuestions > 100 ||
      !Number.isInteger(calibration.leftRows) || calibration.leftRows < 1 ||
      calibration.leftRows > totalQuestions ||
      ![calibration.firstColumnA.x,calibration.firstColumnA.y,
        calibration.secondColumnA.x,calibration.secondColumnA.y,
        calibration.bubbleSpacing,calibration.rowSpacing,calibration.bubbleRadius,
        imageWidth,imageHeight].every(Number.isFinite) ||
      calibration.bubbleSpacing <= 0 || calibration.rowSpacing <= 0 ||
      calibration.bubbleRadius < 3 || imageWidth <= 0 || imageHeight <= 0)
    throw new Error("Parámetros de calibración inválidos");
  return Array.from({length:totalQuestions},(_,index) => {
    const left = index < calibration.leftRows;
    const origin = left ? calibration.firstColumnA : calibration.secondColumnA;
    const rowIndex = left ? index : index - calibration.leftRows;
    const bubbles = Array.from({length:4},(_,option):BubblePosition => ({
      x: origin.x + option*calibration.bubbleSpacing,
      y: origin.y + rowIndex*calibration.rowSpacing,
      radius: calibration.bubbleRadius
    })) as [BubblePosition,BubblePosition,BubblePosition,BubblePosition];
    if (bubbles.some(b => b.x-b.radius < 0 || b.y-b.radius < 0 ||
      b.x+b.radius >= imageWidth || b.y+b.radius >= imageHeight))
      throw new Error("La calibración excede los límites de la imagen");
    return {number:index+1,bubbles};
  });
}
