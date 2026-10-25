const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {stripTypeScriptTypes}=require("node:module");
const path=require("node:path");
let state,queue=Promise.resolve();
function user(overrides={}){return {active:true,accountType:"INDIVIDUAL",subscriptionStatus:"ACTIVE",subscriptionEndsAt:new Date(Date.now()+86400000),monthlyAiLimit:2,monthlyAiUsed:0,...overrides};}
function reset(overrides={}){state={user:user(overrides),jobs:{a:{userId:"u",aiChargedAt:null},b:{userId:"u",aiChargedAt:null}}};}
const db={
 user:{findUnique:async()=>state.user},
 $transaction:async fn=>{
  const previous=queue;let done;queue=new Promise(r=>done=r);await previous;
  const draft=structuredClone(state);
  const tx={
   paesInternalJob:{
    updateMany:async({where,data})=>{const j=draft.jobs[where.id];if(!j||j.userId!==where.userId||j.aiChargedAt!==null)return {count:0};Object.assign(j,data);return {count:1};},
    findFirst:async({where})=>{const j=draft.jobs[where.id];return j?.userId===where.userId?j:null;}
   },
   user:{
    findUnique:async()=>draft.user,
    updateMany:async({where})=>{const u=draft.user;if(!u.active||u.monthlyAiUsed>=where.monthlyAiUsed.lt)return {count:0};u.monthlyAiUsed++;return {count:1};}
   }
  };
  try{const result=await fn(tx);state=draft;return result;}finally{done();}
 }
};
const filename=process.env.PAES_USAGE_SOURCE||path.join(__dirname,"../lib/paes/ai-usage.server.ts");
const source=fs.readFileSync(filename,"utf8").replace(/^import .*;\n/gm,"");
const js=stripTypeScriptTypes(source,{mode:"transform"}).replace(/export /g,"");
const api=new Function("prisma","checkAiEntitlement",js+";return {chargeCompletedPaes,assertPaesAiAccess};")(db,async()=>({ok:state.user.monthlyAiUsed<state.user.monthlyAiLimit,error:"Quota exhausted"}));
test("PAES quota transactions",async t=>{
 await t.test("concurrent completion retries charge a single creation",async()=>{reset();await Promise.all(Array.from({length:8},()=>api.chargeCompletedPaes("u","a")));assert.equal(state.user.monthlyAiUsed,1);assert.ok(state.jobs.a.aiChargedAt);});
 await t.test("only one of two exams can consume the final credit",async()=>{reset({monthlyAiLimit:1});const results=await Promise.allSettled([api.chargeCompletedPaes("u","a"),api.chargeCompletedPaes("u","b")]);assert.equal(results.filter(x=>x.status==="fulfilled").length,1);assert.equal(state.user.monthlyAiUsed,1);assert.equal(Object.values(state.jobs).filter(j=>j.aiChargedAt).length,1);});
 await t.test("a charged result remains retrievable at zero remaining credits",async()=>{reset({monthlyAiLimit:1});await api.chargeCompletedPaes("u","a");await api.chargeCompletedPaes("u","a");assert.equal(state.user.monthlyAiUsed,1);});
 await t.test("expired and inactive accounts roll back receipt and counter",async()=>{for(const change of [{active:false},{subscriptionEndsAt:new Date(0)}]){reset(change);await assert.rejects(api.chargeCompletedPaes("u","a"));assert.equal(state.jobs.a.aiChargedAt,null);assert.equal(state.user.monthlyAiUsed,0);}});
 await t.test("trial respects five-generation cap",async()=>{reset({subscriptionStatus:"TRIAL",trialEndsAt:new Date(Date.now()+86400000),monthlyAiLimit:90,monthlyAiUsed:5});await assert.rejects(api.chargeCompletedPaes("u","a"));assert.equal(state.user.monthlyAiUsed,5);assert.equal(state.jobs.a.aiChargedAt,null);});
 await t.test("another user cannot charge this job",async()=>{reset();await assert.rejects(api.chargeCompletedPaes("other","a"));assert.equal(state.user.monthlyAiUsed,0);});
 await t.test("institutional policy matches existing entitlement helper",async()=>{reset({accountType:"INSTITUTIONAL"});await api.chargeCompletedPaes("u","a");assert.equal(state.user.monthlyAiUsed,0);assert.ok(state.jobs.a.aiChargedAt);});
 await t.test("generation access is rejected when quota is exhausted",async()=>{reset({monthlyAiUsed:2});await assert.rejects(api.assertPaesAiAccess("u"));});
});
