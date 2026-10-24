/** Image-quality checks before optical correction. These are advisory only. */
export type SimceImageQuality = {
  meanLuminance: number;
  contrast: number;
  sharpness: number;
  warnings: string[];
};

/** Evaluates a subsampled RGBA raster without sending student data anywhere. */
export function assessSimceImageQuality(
  data: Uint8ClampedArray, width: number, height: number
): SimceImageQuality {
  if (!Number.isInteger(width) || !Number.isInteger(height) ||
      width < 32 || height < 32 || data.length !== width * height * 4)
    throw new Error("Imagen inválida para control de calidad");
  const stride = Math.max(1,Math.floor(Math.min(width,height)/300));
  let n=0,sum=0,sumSq=0,edges=0,edgeSum=0;
  const luminance=(x:number,y:number)=>{
    const i=(y*width+x)*4;
    return 0.2126*data[i]+0.7152*data[i+1]+0.0722*data[i+2];
  };
  for(let y=1;y<height-1;y+=stride){
    for(let x=1;x<width-1;x+=stride){
      const v=luminance(x,y);
      sum+=v;sumSq+=v*v;n++;
      const gradient=Math.abs(luminance(x+1,y)-luminance(x-1,y))+
        Math.abs(luminance(x,y+1)-luminance(x,y-1));
      edgeSum+=gradient;edges++;
    }
  }
  const meanLuminance=sum/n;
  const contrast=Math.sqrt(Math.max(0,sumSq/n-meanLuminance*meanLuminance));
  const sharpness=edgeSum/edges;
  const warnings:string[]=[];
  if(Math.min(width,height)<900)warnings.push("Resolución baja: utiliza una fotografía más nítida y cercana.");
  if(meanLuminance<85)warnings.push("Imagen oscura: mejora la iluminación.");
  if(meanLuminance>245)warnings.push("Imagen muy clara: verifica que las marcas sean visibles.");
  if(contrast<25)warnings.push("Contraste bajo: revisa la exposición y el lápiz utilizado.");
  if(sharpness<9)warnings.push("Posible desenfoque: repite la fotografía sin movimiento.");
  return {meanLuminance,contrast,sharpness,warnings};
}
