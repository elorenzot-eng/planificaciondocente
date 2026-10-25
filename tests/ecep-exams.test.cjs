const {test}=require("node:test");
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {stripTypeScriptTypes}=require("node:module");
const root=process.env.ECEP_TEST_ROOT||path.join(__dirname,"..");
function load(file,deps,names){
 const source=fs.readFileSync(path.join(root,file),"utf8").replace(/^import .*;\r?\n/gm,"");
 const code=stripTypeScriptTypes(source,{mode:"transform"}).replace(/\bexport /g,"");
 return new Function(...Object.keys(deps),code+";return {"+names.join(",")+"};")(...Object.values(deps));
}
const {buildEcepPlan,validateEcepBatch,validateCompletedEcep,topicKey,ECEP_DIFFICULTIES}=load("lib/ecep/exam.ts",{},["buildEcepPlan","validateEcepBatch","validateCompletedEcep","topicKey","ECEP_DIFFICULTIES"]);
const {ecepPrintable}=load("lib/ecep/print.ts",{},["ecepPrintable"]);
function catalog(){
 if(process.env.ECEP_CATALOG_FIXTURE)return JSON.parse(fs.readFileSync(process.env.ECEP_CATALOG_FIXTURE,"utf8"));
 const source=fs.readFileSync(path.join(root,"lib/ecep-topics.ts"),"utf8");
 const refs=[...source.matchAll(/import (\w+) from "\.\.\/([^"]+)";/g)];
 const deps=Object.fromEntries(refs.map(m=>[m[1],JSON.parse(fs.readFileSync(path.join(root,m[2]),"utf8"))]));
 return load("lib/ecep-topics.ts",deps,["topics"]).topics;
}
const topics=catalog(),config=t=>({specialtyKey:topicKey(t),quantity:60,difficulty:"Mixta",domain:-1});
const items=plan=>plan.map(p=>({...p,stem:"Caso disciplinar y pedagógico original número "+p.number+". ¿Cuál decisión corresponde?",options:["Alternativa correcta","Segunda alternativa","Tercera alternativa","Cuarta alternativa"],correctIndex:0,explanation:"FUNDAMENTO_DOCENTE_EXCLUSIVO con criterio disciplinar y evidencia suficiente.",rationales:Array.from({length:4},(_,i)=>"JUSTIFICACION_EXCLUSIVA alternativa "+i+" con fundamento suficiente.")}));
test("all loaded ECEP specialties support both dimensions and exact 18/24/18 mixed plans",()=>{
 assert.equal(topics.length,50);
 for(const topic of topics){
  for(const quantity of [10,30,60]){
   const plan=buildEcepPlan(topic,{...config(topic),quantity});
   assert.equal(plan.length,quantity);
   for(const [difficulty,share] of [["Baja",0.3],["Media",0.4],["Alta",0.3]])assert.equal(plan.filter(p=>p.difficulty===difficulty).length,quantity*share);
   assert.deepEqual([...new Set(plan.map(p=>p.dimension))].sort(),["Disciplinar","Pedagógico"].sort());
   assert.equal(validateCompletedEcep(items(plan),plan).length,quantity);
   const domainCount=topic.dominios.filter(d=>d.subdominios.some(s=>s.indicadores.some(i=>i.trim()))).length;
   if(quantity>=domainCount)assert.equal(new Set(plan.map(p=>p.referenceId.split(".")[0])).size,domainCount);
  }
 }
});
test("a specific domain stays within its loaded indicators",()=>{
 for(const topic of topics)for(let domain=0;domain<topic.dominios.length;domain++){
  const d=topic.dominios[domain];
  if(!d.subdominios.some(s=>s.indicadores.some(i=>i.trim()))){assert.throws(()=>buildEcepPlan(topic,{...config(topic),domain}));continue;}
  for(const difficulty of ["Baja","Media","Alta"]){
   const plan=buildEcepPlan(topic,{...config(topic),domain,difficulty,quantity:10});
   assert.ok(plan.every(p=>p.domain===d.nombre&&p.difficulty===difficulty));
   for(const p of plan)assert.ok(d.subdominios.some(s=>s.indicadores.includes(p.indicator)));
  }
 }
});
test("invalid count, domain, or absent indicators are rejected",()=>{
 assert.throws(()=>buildEcepPlan(topics[0],{...config(topics[0]),quantity:59}));
 assert.throws(()=>buildEcepPlan(topics[0],{...config(topics[0]),domain:999}));
 assert.throws(()=>buildEcepPlan({...topics[0],dominios:[]},config(topics[0])));
});
test("wrong keys, duplicate choices, wrong references, missing rationales and repeated items are rejected",()=>{
 const plan=buildEcepPlan(topics[0],config(topics[0])).slice(0,5);
 for(const change of [q=>q.correctIndex=4,q=>q.options[1]=q.options[0],q=>q.referenceId="invented",q=>q.dimension="invented",q=>q.difficulty="invented",q=>q.rationales=[],q=>q.stem=""]){
  const batch=items(plan);change(batch[0]);assert.throws(()=>validateEcepBatch({items:batch},plan));
 }
 const batch=items(plan);assert.throws(()=>validateEcepBatch({items:batch},plan,[batch[0]]));
});
test("student output excludes all keys and rationales; teacher output includes full specification table; HTML is escaped",()=>{
 const plan=buildEcepPlan(topics[0],config(topics[0])).slice(0,5),questions=items(plan);
 questions[0].stem='<script>alert("test")</script> Caso original de práctica para evaluar.';
 const student=ecepPrintable("Prueba",topics[0].nivel,questions,false),teacher=ecepPrintable("Prueba",topics[0].nivel,questions,true);
 for(const secret of ["FUNDAMENTO_DOCENTE_EXCLUSIVO","JUSTIFICACION_EXCLUSIVA","Clave:"])assert.ok(!student.includes(secret));
 assert.ok(teacher.includes("FUNDAMENTO_DOCENTE_EXCLUSIVO"));
 for(const field of ["Tabla de especificaciones","Dimensión","Complejidad",plan[0].indicator])assert.ok(teacher.includes(field));
 assert.ok(student.includes("&lt;script&gt;"));assert.ok(!student.includes("<script>"));
});
test("AI generator rejects an invalid batch and retries with the same assigned plan",async()=>{
 const plan=buildEcepPlan(topics[0],config(topics[0])).slice(0,5);let calls=0;
 const fetch=async(_url,options)=>{calls++;const body=JSON.parse(options.body),request=JSON.parse(body.messages[1].content);assert.deepEqual(request.plan,plan);return {ok:true,json:async()=>({choices:[{finish_reason:"stop",message:{content:JSON.stringify({items:calls===1?[]:items(plan)})}}]})};};
 const generator=load("lib/ecep/generate.server.ts",{validateEcepBatch,fetch,process:{env:{OPENAI_API_KEY:"test"}},console:{warn:()=>{}}},["generateEcepBatch"]);
 const result=await generator.generateEcepBatch(topics[0].especialidad,topics[0].nivel,plan,[]);
 assert.equal(calls,2);assert.equal(result.length,5);
});
test("AI failure never returns unvalidated questions",async()=>{
 const generator=load("lib/ecep/generate.server.ts",{validateEcepBatch,fetch:async()=>({ok:false,status:502}),process:{env:{OPENAI_API_KEY:"test"}},console:{warn:()=>{}}},["generateEcepBatch"]);
 await assert.rejects(generator.generateEcepBatch("A","B",buildEcepPlan(topics[0],config(topics[0])).slice(0,5),[]));
});
test("completion receipt and quota are atomic and idempotent",async t=>{
 let state,queue=Promise.resolve();
 class PaesQuotaError extends Error{}
 function reset(overrides={}){state={user:{active:true,accountType:"INDIVIDUAL",subscriptionStatus:"ACTIVE",subscriptionEndsAt:new Date(Date.now()+86400000),monthlyAiLimit:1,monthlyAiUsed:0,...overrides},jobs:{a:{userId:"u",status:"PENDING",quantity:10,nextIndex:10,aiChargedAt:null},b:{userId:"u",status:"PENDING",quantity:10,nextIndex:10,aiChargedAt:null}}};}
 const prisma={$transaction:async fn=>{
  const previous=queue;let done;queue=new Promise(r=>done=r);await previous;const draft=structuredClone(state);
  const tx={ecepExam:{updateMany:async({where,data})=>{const j=draft.jobs[where.id];if(!j||j.userId!==where.userId||j.status!==where.status||j.nextIndex!==where.nextIndex||j.quantity!==where.quantity||j.aiChargedAt!==null)return {count:0};Object.assign(j,data);return {count:1};},findFirst:async({where})=>{const j=draft.jobs[where.id];return j?.userId===where.userId&&j.status==="COMPLETED"&&j.aiChargedAt?j:null;}},user:{findUnique:async()=>draft.user,updateMany:async({where})=>{if(!draft.user.active||draft.user.monthlyAiUsed>=where.monthlyAiUsed.lt)return {count:0};draft.user.monthlyAiUsed++;return {count:1};}}};
  try{const result=await fn(tx);state=draft;return result;}finally{done();}
 }};
 const {completeEcepExam}=load("lib/ecep/usage.server.ts",{prisma,PaesQuotaError},["completeEcepExam"]);
 await t.test("repeated and concurrent completion consumes exactly one credit",async()=>{reset();await Promise.all(Array.from({length:6},()=>completeEcepExam("u","a",10)));assert.equal(state.user.monthlyAiUsed,1);assert.equal(state.jobs.a.status,"COMPLETED");});
 await t.test("only one of two completed exams receives the final credit",async()=>{reset();const r=await Promise.allSettled([completeEcepExam("u","a",10),completeEcepExam("u","b",10)]);assert.equal(r.filter(x=>x.status==="fulfilled").length,1);assert.equal(state.user.monthlyAiUsed,1);assert.equal(Object.values(state.jobs).filter(j=>j.status==="COMPLETED").length,1);});
 await t.test("incomplete, foreign and expired exams cannot consume a credit",async()=>{reset();state.jobs.a.nextIndex=5;await assert.rejects(completeEcepExam("u","a",10));assert.equal(state.user.monthlyAiUsed,0);reset();await assert.rejects(completeEcepExam("other","a",10));assert.equal(state.user.monthlyAiUsed,0);reset({subscriptionEndsAt:new Date(0)});await assert.rejects(completeEcepExam("u","a",10));assert.equal(state.jobs.a.status,"PENDING");assert.equal(state.user.monthlyAiUsed,0);});
});

test("ECEP API checkpoints, resumes, enforces ownership and protects newer execution leases",async t=>{
 let record=null,authenticated=true,generated=0,takeover=false,fail=false,charges=new Set(),calls=0;
 class PaesQuotaError extends Error{}
 const userId="u",topic=topics[0],requestBody={...config(topic),quantity:10};
 const response=(body,options={})=>({status:options.status||200,body});
 function matches(where){
  if(!record||record.id!==where.id||where.userId&&record.userId!==where.userId)return false;
  if(where.nextIndex!==undefined&&record.nextIndex!==where.nextIndex)return false;
  if(where.status&&record.status!==where.status)return false;
  if(where.leaseToken&&record.leaseToken!==where.leaseToken)return false;
  if(where.OR&&!where.OR.some(o=>record.status===o.status&&(!o.updatedAt||record.updatedAt<o.updatedAt.lt)))return false;
  return true;
 }
 const prisma={user:{findFirst:async()=>authenticated?{id:userId}:null},ecepExam:{
  create:async({data})=>record={...data,id:"job",status:"PENDING",nextIndex:0,questions:[],leaseToken:null,aiChargedAt:null,updatedAt:new Date()},
  findFirst:async({where})=>record&&record.id===where.id&&record.userId===where.userId?structuredClone(record):null,
  updateMany:async({where,data})=>{if(!matches(where))return {count:0};Object.assign(record,data,{updatedAt:new Date()});return {count:1};}
 }};
 const api=load("app/api/ecep/ensayos/route.ts",{
  NextResponse:{json:response},randomUUID:()=>String(++calls),getSession:async()=>authenticated?{id:userId}:null,prisma,topics,
  buildEcepPlan,topicKey,ECEP_DIFFICULTIES,validateCompletedEcep,
  generateEcepBatch:async(_specialty,_level,plan)=>{generated++;if(fail)throw Error("Provider failure");if(takeover)record.leaseToken="newer-worker";return items(plan);},
  completeEcepExam:async(_user,id)=>{charges.add(id);record.status="COMPLETED";record.aiChargedAt=new Date();},
  assertPaesAiAccess:async()=>{},PaesQuotaError,process:{env:{OPENAI_API_KEY:"test"}},console:{error:()=>{}}
 },["POST"]);
 const post=body=>api.POST({json:async()=>body});
 await t.test("anonymous requests do not create jobs",async()=>{authenticated=false;assert.equal((await post(requestBody)).status,401);assert.equal(record,null);authenticated=true;});
 await t.test("creating the checkpoint does not generate or charge",async()=>{const r=await post(requestBody);assert.equal(r.status,202);assert.equal(r.body.completed,0);assert.equal(generated,0);assert.equal(charges.size,0);assert.equal(record.planSnapshot.length,10);});
 await t.test("foreign users and altered configuration cannot resume",async()=>{record.userId="other";assert.equal((await post({...requestBody,jobId:"job"})).status,404);record.userId=userId;assert.equal((await post({...requestBody,quantity:30,jobId:"job"})).status,400);});
 await t.test("failed generation preserves the checkpoint and does not charge",async()=>{fail=true;const r=await post({...requestBody,jobId:"job"});assert.equal(r.status,422);assert.equal(record.status,"PENDING");assert.equal(record.nextIndex,0);assert.equal(charges.size,0);fail=false;});
 await t.test("expired RUNNING lease is recovered without losing questions",async()=>{record.status="RUNNING";record.updatedAt=new Date(0);const r=await post({...requestBody,jobId:"job"});assert.equal(r.status,200);assert.equal(record.nextIndex,5);assert.equal(charges.size,0);});
 await t.test("an obsolete worker cannot overwrite the newer lease",async()=>{takeover=true;const r=await post({...requestBody,jobId:"job"});assert.equal(r.status,409);assert.equal(record.nextIndex,5);assert.equal(record.leaseToken,"newer-worker");takeover=false;record.status="PENDING";record.leaseToken=null;});
 await t.test("finalization happens after all questions and repeated requests reuse the receipt",async()=>{await post({...requestBody,jobId:"job"});assert.equal(record.nextIndex,10);assert.equal(charges.size,0);const r=await post({...requestBody,jobId:"job"});assert.equal(r.body.status,"COMPLETED");await post({...requestBody,jobId:"job"});assert.equal(charges.size,1);});
});
