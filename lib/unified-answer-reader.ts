import { buildSimceGrid } from "./simce-paper-grid";
import { readCalibratedSheet, type Raster, type OmrSheetResult } from "./simce-paper-sheet-reader";
import { createUnifiedAnswerSheet, type ExamFamily, type ExamSubject } from "./unified-answer-sheet";

/** Read calibrated page rasters and return globally numbered answers.
 * This does not rectify photos, identify students or grade against a key.
 */
export function readUnifiedAnswerPages(
  family: ExamFamily,
  subject: ExamSubject,
  totalQuestions: number,
  pages: readonly Raster[],
): OmrSheetResult {
  const sheet=createUnifiedAnswerSheet(family,subject,totalQuestions);
  if (pages.length !== sheet.pages.length) throw new Error("Cantidad de páginas OMR incorrecta");
  const answers:OmrSheetResult["answers"]=[];
  const measurements:OmrSheetResult["measurements"]=[];
  const reviewNumbers:number[]=[];
  for(let i=0;i<pages.length;i++){
    const raster=pages[i],page=sheet.pages[i],c=sheet.calibration;
    const rows=buildSimceGrid(page.questionCount,{
      firstColumnA:{x:c.leftX*raster.width,y:c.leftY*raster.height},
      secondColumnA:{x:c.rightX*raster.width,y:c.rightY*raster.height},
      bubbleSpacing:c.spacing*raster.width,
      rowSpacing:c.rowSpacing*raster.height,
      bubbleRadius:c.radius*Math.min(raster.width,raster.height),
      leftRows:page.leftRows
    },raster.width,raster.height);
    const result=readCalibratedSheet(raster,rows);
    const offset=page.startQuestion-1;
    answers.push(...result.answers.map(a=>({...a,number:a.number+offset})));
    measurements.push(...result.measurements.map(m=>({...m,number:m.number+offset})));
    reviewNumbers.push(...result.reviewNumbers.map(n=>n+offset));
  }
  return {answers,measurements,reviewNumbers};
}
