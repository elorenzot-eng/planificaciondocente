const {PrismaClient}=require('@prisma/client');
const prisma=new PrismaClient();
const units=require('./catalogs/tp-module-units.cjs');
async function main(){
 const modules=await prisma.curriculumModule.findMany({where:{active:true},include:{objectives:true}});
 for(const module of modules){
  const spec=units.find(x=>x.code===module.code); if(!spec) continue;
  await prisma.curriculumModuleUnit.updateMany({where:{moduleId:module.id},data:{active:false}});
  for(let i=0;i<spec.titles.length;i++){
   const unit=await prisma.curriculumModuleUnit.upsert({where:{moduleId_number:{moduleId:module.id,number:i+1}},update:{title:spec.titles[i],source:'Currículum Nacional · MINEDUC',sourceUrl:spec.url,active:true},create:{moduleId:module.id,number:i+1,title:spec.titles[i],source:'Currículum Nacional · MINEDUC',sourceUrl:spec.url,active:true}});
   await prisma.curriculumModuleUnitObjective.deleteMany({where:{unitId:unit.id}});
   for(const link of module.objectives) await prisma.curriculumModuleUnitObjective.create({data:{unitId:unit.id,objectiveId:link.objectiveId}});
  }
  console.log('TP units '+module.code+' '+spec.titles.length);
 }
}
main().finally(()=>prisma.$disconnect());
