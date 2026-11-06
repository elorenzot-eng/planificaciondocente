import { createUnifiedAnswerSheet, type ExamFamily, type ExamSubject } from "./unified-answer-sheet";

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
/** Vector sheet using the same millimetre coordinates as the calibrated OMR reader.
 * SVG can be printed or converted to PDF by a separate rendering pipeline.
 */
export function renderUnifiedAnswerSvg(family:ExamFamily,subject:ExamSubject,totalQuestions:number,pageIndex=0):string {
 const sheet=createUnifiedAnswerSheet(family,subject,totalQuestions),page=sheet.pages[pageIndex];
 if(!page) throw new Error("Página OMR inexistente");
 const p=sheet.paper, items:string[]=[];
 const text=(x:number,y:number,value:string,size=3.6)=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="#111">${esc(value)}</text>`;
 const circle=(x:number,y:number,r:number)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="white" stroke="#111" stroke-width="0.35"/>`;
 const left=p.fiducialLeft,right=p.fiducialRight,top=p.fiducialTop,bottom=p.fiducialBottom;
 for(const [x,y] of [[left,top],[right,top],[left,bottom],[right,bottom]]) items.push(`<rect x="${x-2}" y="${y-2}" width="4" height="4" fill="#000"/>`);
 items.push(text(25,27,sheet.title,6),text(25,36,"Curso: __________________",4),text(25,45,"RUT: __________________",4));
 // Keep the RUT field separate from the answer bubbles and fiducials.
 items.push(text(25,51,`Página ${pageIndex+1} de ${sheet.pages.length} · Preguntas ${page.startQuestion}–${page.startQuestion+page.questionCount-1}`,3));
 for(let i=0;i<page.questionCount;i++){
  const isLeft=i<page.leftRows,localRow=isLeft?i:i-page.leftRows;
  const x=isLeft?p.firstLeftX:p.firstRightX,y=p.firstY+localRow*p.rowStep;
  items.push(text(x-11,y+1.2,String(page.startQuestion+i)+".",3.4));
  for(let j=0;j<4;j++){const bx=x+j*p.optionStep;items.push(circle(bx,y,p.bubbleDiameter/2),text(bx-1.2,y+1.15,["A","B","C","D"][j],3));}
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297" role="img" aria-label="${esc(sheet.title)}">${items.join("")}</svg>`;
}
