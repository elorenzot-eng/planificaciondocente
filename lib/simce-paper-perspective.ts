import type { RegistrationCorners, RegistrationPoint } from "./simce-paper-registration";

type Matrix = [number,number,number,number,number,number,number,number];
/** Projective map from normalized sheet coordinates (0..1) to image pixels. */
export function createSheetProjection(c:RegistrationCorners) {
  const p=[c.topLeft,c.topRight,c.bottomLeft,c.bottomRight];
  const pairs:[number,number,RegistrationPoint][]=[[0,0,p[0]],[1,0,p[1]],[0,1,p[2]],[1,1,p[3]]];
  const rows:number[][]=pairs.flatMap(([u,v,point])=>[
    [u,v,1,0,0,0,-u*point.x,-v*point.x,point.x],
    [0,0,0,u,v,1,-u*point.y,-v*point.y,point.y]
  ]);
  for(let col=0;col<8;col++){
    let pivot=col;
    for(let i=col+1;i<8;i++)if(Math.abs(rows[i][col])>Math.abs(rows[pivot][col]))pivot=i;
    if(Math.abs(rows[pivot][col])<1e-8)throw new Error("Marcas degeneradas: no se puede corregir perspectiva");
    [rows[col],rows[pivot]]=[rows[pivot],rows[col]];
    const scale=rows[col][col];
    for(let j=col;j<=8;j++)rows[col][j]/=scale;
    for(let i=0;i<8;i++)if(i!==col){
      const factor=rows[i][col];
      for(let j=col;j<=8;j++)rows[i][j]-=factor*rows[col][j];
    }
  }
  const h=rows.map(r=>r[8]) as Matrix;
  return (u:number,v:number):RegistrationPoint=>{
    const denominator=h[6]*u+h[7]*v+1;
    if(Math.abs(denominator)<1e-8)throw new Error("Proyección de perspectiva inválida");
    return {x:(h[0]*u+h[1]*v+h[2])/denominator,y:(h[3]*u+h[4]*v+h[5])/denominator};
  };
}
/** Rectify the rectangle bounded by fiducial centers. */
export function rectifySheet(
  source:ImageData,corners:RegistrationCorners,targetWidth=1200,targetHeight=1600
):ImageData {
  if(targetWidth<100||targetHeight<100||targetWidth>4000||targetHeight>5000)
    throw new Error("Dimensiones de hoja inválidas");
  const project=createSheetProjection(corners);
  const out=new ImageData(targetWidth,targetHeight);
  const input=source.data,output=out.data;
  for(let y=0;y<targetHeight;y++)for(let x=0;x<targetWidth;x++){
    const point=project(x/(targetWidth-1),y/(targetHeight-1));
    const sx=Math.round(point.x),sy=Math.round(point.y);
    const dst=(y*targetWidth+x)*4;
    if(sx<0||sy<0||sx>=source.width||sy>=source.height){
      output[dst]=output[dst+1]=output[dst+2]=255;output[dst+3]=255;continue;
    }
    const src=(sy*source.width+sx)*4;
    output[dst]=input[src];output[dst+1]=input[src+1];output[dst+2]=input[src+2];output[dst+3]=255;
  }
  return out;
}
