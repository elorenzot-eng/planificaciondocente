import {measureBubble} from "./simce-paper-omr";
export type PaesMark="A"|"B"|"C"|"D"|"E"|null|"MULTIPLE"|"UNCERTAIN";
export type PaesBubble={x:number;y:number;radius:number};
export type PaesRow={number:number;bubbles:PaesBubble[]};
export function readPaesSheet(raster:{data:Uint8ClampedArray;width:number;height:number},rows:PaesRow[],alternatives:4|5){
 if(!rows.length||rows.length>100||new Set(rows.map(r=>r.number)).size!==rows.length)throw Error("Filas inválidas");
 return rows.map(row=>{
  if(!Number.isInteger(row.number)||row.number<1||row.number>100||row.bubbles.length!==alternatives)throw Error("Geometría PAES inválida");
  const darkness=row.bubbles.map(b=>{if(![b.x,b.y,b.radius].every(Number.isFinite)||b.x-b.radius<0||b.y-b.radius<0||b.x+b.radius>=raster.width||b.y+b.radius>=raster.height)throw Error("Burbuja fuera de imagen");return measureBubble(raster.data,raster.width,raster.height,b.x,b.y,b.radius)});
  const ranked=darkness.map((value,index)=>({value,index})).sort((a,b)=>b.value-a.value);
  const first=ranked[0],second=ranked[1];let mark:PaesMark=null;
  if(first.value<0.32*0.6)mark=null;
  else if(first.value<0.32)mark="UNCERTAIN";
  else if(second.value>=0.32)mark="MULTIPLE";
  else if(first.value-second.value<0.13)mark="UNCERTAIN";
  else mark=("ABCDE"[first.index]) as PaesMark;
  return {number:row.number,mark,confidence:mark==="UNCERTAIN"||mark==="MULTIPLE"?0:Math.min(1,(first.value-second.value)/0.13),darkness};
 });
}
export function buildPaesGrid(count:number,alternatives:4|5,width:number,height:number,cal:{leftX:number;rightX:number;leftY:number;rightY:number;spacing:number;rowSpacing:number;radius:number;leftRows:number}):PaesRow[]{
 if(!Number.isInteger(count)||count<1||count>100||!Number.isInteger(cal.leftRows)||cal.leftRows<1||cal.leftRows>count)throw Error("Calibración inválida");
 return Array.from({length:count},(_,i)=>{const left=i<cal.leftRows;const y=(left?cal.leftY:cal.rightY)*height+(left?i:i-cal.leftRows)*cal.rowSpacing*height;const x=(left?cal.leftX:cal.rightX)*width;return {number:i+1,bubbles:Array.from({length:alternatives},(_,j)=>({x:x+j*cal.spacing*width,y,radius:cal.radius*Math.min(width,height)}))};});
}
