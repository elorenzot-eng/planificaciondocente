/** Locates the four solid black registration squares on a photographed sheet.
 * This is a candidate detector, not a perspective transform. Reject uncertain matches.
 */
export type RegistrationPoint = {x:number;y:number};
export type RegistrationCorners = {
  topLeft:RegistrationPoint;topRight:RegistrationPoint;
  bottomLeft:RegistrationPoint;bottomRight:RegistrationPoint;
};
export function detectRegistrationCorners(
  rgba:Uint8ClampedArray,width:number,height:number
):RegistrationCorners {
  if(width<200||height<200||rgba.length!==width*height*4)throw new Error("Resolución insuficiente");
  const step=Math.max(1,Math.ceil(Math.max(width,height)/850));
  const w=Math.floor(width/step),h=Math.floor(height/step);
  const dark=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=((y*step)*width+x*step)*4;
    const light=0.2126*rgba[i]+0.7152*rgba[i+1]+0.0722*rgba[i+2];
    dark[y*w+x]=light<85?1:0;
  }
  const seen=new Uint8Array(w*h);
  const found:{x:number;y:number;area:number}[]=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const start=y*w+x;
    if(!dark[start]||seen[start])continue;
    const queue=[start];seen[start]=1;
    let head=0,minX=x,maxX=x,minY=y,maxY=y;
    while(head<queue.length){
      const index=queue[head++],px=index%w,py=Math.floor(index/w);
      minX=Math.min(minX,px);maxX=Math.max(maxX,px);
      minY=Math.min(minY,py);maxY=Math.max(maxY,py);
      for(const next of [index-1,index+1,index-w,index+w]){
        if(next<0||next>=dark.length||seen[next]||!dark[next])continue;
        const nx=next%w;
        if(Math.abs(nx-px)>1)continue;
        seen[next]=1;queue.push(next);
      }
    }
    const bw=maxX-minX+1,bh=maxY-minY+1,area=queue.length;
    if(bw>=5&&bh>=5&&bw<=w*0.12&&bh<=h*0.12&&
      Math.abs(bw-bh)/Math.max(bw,bh)<0.3&&area/(bw*bh)>0.75)
      found.push({x:(minX+maxX+1)*step/2,y:(minY+maxY+1)*step/2,area});
  }
  const corners=[
    {name:"topLeft",x:0,y:0},
    {name:"topRight",x:width,y:0},
    {name:"bottomLeft",x:0,y:height},
    {name:"bottomRight",x:width,y:height}
  ] as const;
  const used=new Set<number>();
  const result:Partial<RegistrationCorners>={};
  for(const corner of corners){
    const candidates=found.map((p,i)=>({p,i,d:Math.hypot((p.x-corner.x)/width,(p.y-corner.y)/height)}))
      .filter(v=>!used.has(v.i)&&v.d<0.42).sort((a,b)=>a.d-b.d);
    if(!candidates.length)throw new Error("No se detectaron cuatro marcas de registro fiables");
    used.add(candidates[0].i);
    result[corner.name]={x:candidates[0].p.x,y:candidates[0].p.y};
  }
  const c=result as RegistrationCorners;
  if(c.topLeft.x>=c.topRight.x||c.bottomLeft.x>=c.bottomRight.x||
     c.topLeft.y>=c.bottomLeft.y||c.topRight.y>=c.bottomRight.y)
    throw new Error("Marcas de registro inconsistentes");
  return c;
}
