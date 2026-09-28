const {PrismaClient}=require("@prisma/client");
const prisma=new PrismaClient();
const source="Currículum Nacional · MINEDUC";
const level="8° Básico";
const subject="Matemática";
// Every block is checked against verifiedOATotals before it is persisted.
const objectives=[
["MA08 OA 01","Mostrar que comprenden la multiplicación y la división de números enteros: representándolos de manera concreta, pictórica y simbólica; aplicando procedimientos usados en la multiplicación y la división de números naturales; aplicando la regla de los signos de la operación; resolviendo problemas rutinarios y no rutinarios."],
["MA08 OA 02","Utilizar las operaciones de multiplicación y división con los números racionales en el contexto de la resolución de problemas: representándolos en la recta numérica; involucrando diferentes conjuntos numéricos (fracciones, decimales y números enteros)."],
["MA08 OA 03","Explicar la multiplicación, la división y el proceso de formar potencias de potencias de base natural y exponente natural hasta 3, de manera concreta, pictórica y simbólica."],
["MA08 OA 04","Mostrar que comprenden las raíces cuadradas de números naturales: estimándolas de manera intuitiva; representándolas de manera concreta, pictórica y simbólica; aplicándolas en situaciones geométricas y en la vida diaria."],
["MA08 OA 05","Resolver problemas que involucran variaciones porcentuales en contextos diversos, usando representaciones pictóricas y registrando el proceso de manera simbólica; por ejemplo: el interés anual del ahorro."],
["MA08 OA 06","Mostrar que comprenden las operaciones de expresiones algebraicas: representándolas de manera pictórica y simbólica; relacionándolas con el área de cuadrados, rectángulos y volúmenes de paralelepípedos; determinando formas factorizadas."],
["MA08 OA 07","Mostrar que comprenden la noción de función por medio de un cambio lineal: utilizando tablas; usando metáforas de máquinas; estableciendo reglas entre x e y; representando de manera gráfica (plano cartesiano, diagramas de Venn), de manera manual y/o con software educativo."],
["MA08 OA 08","Modelar situaciones de la vida diaria y de otras asignaturas, usando ecuaciones lineales de la forma: ax = b; x/a = b, a ≠ 0; ax + b = c; x/a + b = c; ax = b + cx; a(x + b) = c; ax + b = cx + d (a, b, c, d, e ∈ Q)."],
["MA08 OA 09","Resolver inecuaciones lineales con coeficientes racionales en el contexto de la resolución de problemas, por medio de representaciones gráficas, simbólicas, de manera manual y/o con software educativo."],
["MA08 OA 10","Mostrar que comprenden la función afín: generalizándola como la suma de una constante con una función lineal; trasladando funciones lineales en el plano cartesiano; determinando el cambio constante de un intervalo a otro, de manera gráfica y simbólica, de manera manual y/o con software educativo; relacionándola con el interés simple; utilizándola para resolver problemas de la vida diaria y de otras asignaturas."],
["MA08 OA 11","Desarrollar las fórmulas para encontrar el área de superficies y el volumen de prismas rectos con diferentes bases y cilindros: estimando de manera intuitiva área de superficie y volumen; desplegando la red de prismas rectos para encontrar la fórmula del área de superficie; aplicando las aproximaciones del perímetro y del área en la resolución de problemas; aplicando las fórmulas a la resolución de problemas geométricos y de la vida diaria."],
["MA08 OA 12","Explicar, de manera concreta, pictórica y simbólica, la validez del teorema de Pitágoras y aplicar a la resolución de problemas geométricos y de la vida cotidiana, de manera manual y/o con software educativo."],
["MA08 OA 13","Describir la posición y el movimiento (traslaciones, rotaciones y reflexiones) de figuras 2D, de manera manual y/o con software educativo, utilizando: los vectores para la traslación; los ejes del plano cartesiano como ejes de reflexión; los puntos del plano para las rotaciones."],
["MA08 OA 14","Componer rotaciones, traslaciones y reflexiones en el plano cartesiano y en el espacio, de manera manual y/o con software educativo, y aplicar a las simetrías de polígonos y poliedros, y a la resolución de problemas geométricos relacionados con el arte."],
["MA08 OA 15","Mostrar que comprenden las medidas de posición, percentiles y cuartiles: identificando la población que está sobre o bajo el percentil; representándolas con diagramas, incluyendo el diagrama de cajón, de manera manual y/o con software educativo; utilizándolas para comparar poblaciones."],
["MA08 OA 16","Evaluar la forma en que los datos están presentados: comparando la información de los mismos datos representada en distintos tipos de gráficos para determinar fortalezas y debilidades de cada uno; representándolas con diagramas, incluyendo el diagrama de cajón, de manera manual y/o con software educativo; detectando manipulaciones de gráficos para representar datos."],
["MA08 OA 17","Explicar el principio combinatorio multiplicativo: a partir de situaciones concretas; representándolo con tablas y árboles regulares, de manera manual y/o con software educativo; utilizándolo para calcular la probabilidad de un evento compuesto."]
];
async function syncBlock({level,subject,objectives,expected}){
 if(objectives.length!==expected) throw new Error(`OA catalog mismatch for ${subject} ${level}: expected ${expected}, got ${objectives.length}`);
 let created=0,updated=0;
 for(const [code,text] of objectives){
  const rows=await prisma.learningObjective.findMany({where:{code,level,subject},orderBy:{id:"asc"}});
  if(rows.length){
   await prisma.learningObjective.update({where:{id:rows[0].id},data:{text,source}});
   if(rows.length>1) await prisma.learningObjective.deleteMany({where:{id:{in:rows.slice(1).map(x=>x.id)}}});
   updated++;
  }else{await prisma.learningObjective.create({data:{code,text,level,subject,source}});created++;}
 }
 return {created,updated};
}
async function main(){
 const result=await syncBlock({level,subject,objectives,expected:17});
 console.log(`Official OA seed: Matemática 8° Básico created=${result.created} updated=${result.updated} total=${objectives.length}`);
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
