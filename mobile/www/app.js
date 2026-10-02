const API='https://educantay.cl';
const loginView=document.querySelector('#loginView');
const homeView=document.querySelector('#homeView');
const message=document.querySelector('#loginMessage');
const planningView=document.querySelector('#planningView');
let planningData=null;
const assessmentView=document.querySelector('#assessmentView');
let assessmentData=null;
const materialView=document.querySelector('#materialView'),folderView=document.querySelector('#folderView');
let materialData=null,folderData=null;
const showHome=(user)=>{loginView.classList.add('hidden');homeView.classList.remove('hidden');document.querySelector('#userName').textContent=user?.name||'Docente';document.querySelector('#accountType').textContent=user?.accountType||'Cuenta EducAntay'};
const showLogin=()=>{homeView.classList.add('hidden');loginView.classList.remove('hidden')};

async function session(){
  try{
    const res=await fetch(API+'/api/session',{credentials:'include'});
    const data=await res.json();
    if(data.user) showHome(data.user); else showLogin();
  }catch{showLogin();message.textContent='No pudimos conectar con EducAntay. Revisa tu conexión.'}
}

document.querySelector('#loginForm').addEventListener('submit',async(e)=>{
  e.preventDefault(); message.textContent='';
  const button=document.querySelector('#loginButton');button.disabled=true;button.textContent='Ingresando…';
  try{
    const res=await fetch(API+'/api/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:document.querySelector('#email').value,password:document.querySelector('#password').value})});
    const data=await res.json();
    if(!res.ok) throw new Error(data.error||'No fue posible ingresar');
    showHome(data.user);
  }catch(err){message.textContent=err.message||'Error de conexión';}
  finally{button.disabled=false;button.textContent='Ingresar'}
});
document.querySelector('#logoutButton').addEventListener('click',async()=>{try{await fetch(API+'/api/session',{method:'DELETE',credentials:'include'})}finally{showLogin()}});
document.querySelector('#forgotButton').addEventListener('click',()=>location.href=API+'/?forgot=1');

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function openPlanning(){
  homeView.classList.add('hidden');planningView.classList.remove('hidden');
  const msg=document.querySelector('#planningMessage');msg.textContent='Cargando currículum…';
  try{
    const res=await fetch(API+'/api/ai-planning',{credentials:'include'});const data=await res.json();
    if(!res.ok)throw new Error(data.error||'No se pudo cargar Planificación IA');
    planningData=data;renderCourses();msg.textContent='';
  }catch(e){msg.textContent=e.message}
}
function renderCourses(){
  const select=document.querySelector('#courseSelect');
  select.innerHTML='<option value="">Selecciona un curso</option>'+planningData.courses.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  document.querySelector('#subjectSelect').innerHTML='<option value="">Selecciona primero un curso</option>';
  document.querySelector('#objectivesList').innerHTML='<span class="muted">Selecciona curso y asignatura.</span>';
}
document.querySelector('#courseSelect').addEventListener('change',e=>{
  const c=planningData.courses.find(x=>x.id===e.target.value);const subjects=[...new Set((c?.teachingAssignments||[]).map(x=>x.subject).filter(Boolean))];
  if(!subjects.length&&c){planningData.objectives.filter(o=>o.level===c.level).forEach(o=>subjects.push(o.subject));}
  document.querySelector('#subjectSelect').innerHTML='<option value="">Selecciona asignatura</option>'+[...new Set(subjects)].sort().map(s=>`<option>${esc(s)}</option>`).join('');
  renderObjectives();
});
document.querySelector('#subjectSelect').addEventListener('change',renderObjectives);
function renderObjectives(){
  const c=planningData?.courses.find(x=>x.id===document.querySelector('#courseSelect').value);const subject=document.querySelector('#subjectSelect').value;
  const list=(planningData?.objectives||[]).filter(o=>c&&o.level===c.level&&o.subject===subject);
  document.querySelector('#objectivesList').innerHTML=list.length?list.map(o=>`<label class="oa-item"><input type="checkbox" name="oa" value="${esc(o.id)}"><span><strong>${esc(o.code)}</strong> · ${esc(o.text)}</span></label>`).join(''):'<span class="muted">No hay OA disponibles para esta selección.</span>';
}
document.querySelector('#planningBack').addEventListener('click',()=>{planningView.classList.add('hidden');homeView.classList.remove('hidden')});
document.querySelector('#planningForm').addEventListener('submit',async e=>{
  e.preventDefault();const ids=[...document.querySelectorAll('input[name="oa"]:checked')].map(x=>x.value);const msg=document.querySelector('#planningMessage');
  if(!ids.length){msg.textContent='Selecciona al menos un Objetivo de Aprendizaje.';return}
  const loader=document.querySelector('#planningLoader'),button=document.querySelector('#generateButton'),result=document.querySelector('#planningResult');loader.classList.remove('hidden');result.classList.add('hidden');button.disabled=true;msg.textContent='';
  try{
    const res=await fetch(API+'/api/ai-planning',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({courseId:document.querySelector('#courseSelect').value,subject:document.querySelector('#subjectSelect').value,unitId:document.querySelector('#unitSelect').value,objectiveIds:ids,duration:document.querySelector('#durationSelect').value,instructions:document.querySelector('#instructions').value,includeAdaptations:document.querySelector('#adaptations').checked,includeImages:false})});
    const data=await res.json();if(!res.ok)throw new Error(data.error||'No se pudo generar la planificación');
    const p=data.planning?.content||{};const moment=k=>p[k]?`<div class="moment"><h3>${k[0].toUpperCase()+k.slice(1)} · ${esc(p[k].minutos)} min</h3><p><strong>Docente:</strong> ${esc(p[k].actividadesDocente)}</p><p><strong>Estudiantes:</strong> ${esc(p[k].actividadesEstudiantes)}</p></div>`:'';
    result.innerHTML=`<h2>${esc(p.titulo||data.planning?.title||'Planificación')}</h2><p><strong>Objetivo de clase:</strong> ${esc(p.objetivoClase)}</p>${moment('inicio')}${moment('desarrollo')}${moment('cierre')}<p><strong>Evaluación formativa:</strong> ${esc(p.evaluacionFormativa)}</p><p class="muted">Guardada automáticamente en EducAntay.</p>`;result.classList.remove('hidden');
  }catch(err){msg.textContent=err.message||'Error al generar';}finally{loader.classList.add('hidden');button.disabled=false}
});

async function openAssessment(){
 homeView.classList.add('hidden');assessmentView.classList.remove('hidden');const msg=document.querySelector('#assessmentMessage');msg.textContent='Cargando currículum…';
 try{const res=await fetch(API+'/api/ai-assessment',{credentials:'include'});const data=await res.json();if(!res.ok)throw new Error(data.error||'No se pudo cargar Evaluaciones IA');assessmentData=data;
 const s=document.querySelector('#assessmentCourse');s.innerHTML='<option value="">Selecciona un curso</option>'+data.courses.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');msg.textContent='';
 }catch(e){msg.textContent=e.message}
}
function assessmentOAs(){
 const c=assessmentData?.courses.find(x=>x.id===document.querySelector('#assessmentCourse').value),subject=document.querySelector('#assessmentSubject').value;
 const os=(assessmentData?.objectives||[]).filter(o=>c&&o.level===c.level&&o.subject===subject);
 document.querySelector('#assessmentObjectives').innerHTML=os.length?os.map(o=>`<label class="oa-item"><input type="checkbox" name="assessmentOA" value="${esc(o.id)}"><span><strong>${esc(o.code)}</strong> · ${esc(o.text)}</span></label>`).join(''):'<span class="muted">Selecciona curso y asignatura.</span>';
}
document.querySelector('#assessmentCourse').addEventListener('change',e=>{const c=assessmentData.courses.find(x=>x.id===e.target.value);let ss=[...new Set((c?.teachingAssignments||[]).map(x=>x.subject).filter(Boolean))];if(!ss.length&&c)ss=[...new Set(assessmentData.objectives.filter(o=>o.level===c.level).map(o=>o.subject))];document.querySelector('#assessmentSubject').innerHTML='<option value="">Selecciona asignatura</option>'+ss.sort().map(s=>`<option>${esc(s)}</option>`).join('');assessmentOAs()});
document.querySelector('#assessmentSubject').addEventListener('change',assessmentOAs);
document.querySelector('#assessmentBack').addEventListener('click',()=>{assessmentView.classList.add('hidden');homeView.classList.remove('hidden')});
document.querySelector('#assessmentForm').addEventListener('submit',async e=>{
 e.preventDefault();const ids=[...document.querySelectorAll('input[name="assessmentOA"]:checked')].map(x=>x.value),msg=document.querySelector('#assessmentMessage');if(!ids.length){msg.textContent='Selecciona al menos un Objetivo de Aprendizaje.';return}
 const loader=document.querySelector('#assessmentLoader'),button=document.querySelector('#assessmentGenerate'),result=document.querySelector('#assessmentResult');loader.classList.remove('hidden');result.classList.add('hidden');button.disabled=true;msg.textContent='';
 try{const questions=Math.max(1,Math.min(60,Number(document.querySelector('#assessmentQuestions').value)||10));const type=document.querySelector('#assessmentType').value;
 const res=await fetch(API+'/api/ai-assessment',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({courseId:document.querySelector('#assessmentCourse').value,subject:document.querySelector('#assessmentSubject').value,objectiveIds:ids,type,instrument:document.querySelector('#assessmentInstrument').value,questions,duration:document.querySelector('#assessmentDuration').value,instructions:document.querySelector('#assessmentInstructions').value,totalScore:type==='SUMMATIVE'?questions:undefined,difficulty:type==='SUMMATIVE'?60:undefined,includeImages:false})});const data=await res.json();if(!res.ok)throw new Error(data.error||'No se pudo generar la evaluación');
 const a=data.assessment?.content||{},items=Array.isArray(a.items)?a.items:[];const itemHtml=items.map(i=>`<div class="moment"><h3>${esc(i.numero)}. ${esc(i.tipo||'Ítem')}</h3><p>${esc(i.enunciado)}</p>${Array.isArray(i.alternativas)&&i.alternativas.length?'<ol type="A">'+i.alternativas.map(x=>`<li>${esc(x)}</li>`).join('')+'</ol>':''}<small>OA: ${esc(i.oa||'')}</small></div>`).join('');
 const answers=items.map(i=>`<tr><td>${esc(i.numero)}</td><td>${esc(i.respuestaCorrecta||'Revisar pauta')}</td><td>${esc(i.puntaje||'')}</td></tr>`).join('');
 result.innerHTML=`<h2>${esc(a.titulo||data.assessment?.title||'Evaluación')}</h2><p>${esc(a.instrucciones||'')}</p>${itemHtml}<details><summary><strong>Hoja de respuestas correctas</strong></summary><div class="table-wrap"><table><thead><tr><th>Ítem</th><th>Respuesta correcta</th><th>Puntaje</th></tr></thead><tbody>${answers}</tbody></table></div></details><p class="muted">Evaluación guardada automáticamente en EducAntay.</p>`;result.classList.remove('hidden');
 }catch(err){msg.textContent=err.message||'Error al generar';}finally{loader.classList.add('hidden');button.disabled=false}
});

async function openMaterial(){
 homeView.classList.add('hidden');materialView.classList.remove('hidden');const msg=document.querySelector('#materialMessage');msg.textContent='Cargando…';
 try{const [m,p]=await Promise.all([fetch(API+'/api/ai-material',{credentials:'include'}),fetch(API+'/api/ai-planning',{credentials:'include'})]);const md=await m.json(),pd=await p.json();if(!m.ok||!p.ok)throw new Error(md.error||pd.error||'No se pudo cargar Material IA');materialData={...md,courses:pd.courses,objectives:pd.objectives};
 document.querySelector('#materialCourse').innerHTML='<option value="">Selecciona un curso</option>'+pd.courses.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');msg.textContent='';}catch(e){msg.textContent=e.message}
}
function materialSelectors(){const c=materialData?.courses.find(x=>x.id===document.querySelector('#materialCourse').value);let ss=[...new Set((c?.teachingAssignments||[]).map(x=>x.subject).filter(Boolean))];if(!ss.length&&c)ss=[...new Set(materialData.objectives.filter(o=>o.level===c.level).map(o=>o.subject))];document.querySelector('#materialSubject').innerHTML='<option value="">Selecciona asignatura</option>'+ss.sort().map(s=>`<option>${esc(s)}</option>`).join('');materialOAs()}
function materialOAs(){const c=materialData?.courses.find(x=>x.id===document.querySelector('#materialCourse').value),s=document.querySelector('#materialSubject').value,os=(materialData?.objectives||[]).filter(o=>c&&o.level===c.level&&o.subject===s);document.querySelector('#materialObjective').innerHTML='<option value="">Sin OA específico</option>'+os.map(o=>`<option value="${esc(o.id)}">${esc(o.code)} · ${esc(o.text)}</option>`).join('')}
document.querySelector('#materialCourse').addEventListener('change',materialSelectors);document.querySelector('#materialSubject').addEventListener('change',materialOAs);document.querySelector('#materialBack').addEventListener('click',()=>{materialView.classList.add('hidden');homeView.classList.remove('hidden')});
document.querySelector('#materialForm').addEventListener('submit',async e=>{e.preventDefault();const loader=document.querySelector('#materialLoader'),button=document.querySelector('#materialGenerate'),msg=document.querySelector('#materialMessage'),result=document.querySelector('#materialResult');loader.classList.remove('hidden');result.classList.add('hidden');button.disabled=true;msg.textContent='';
 try{const res=await fetch(API+'/api/ai-material',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({courseId:document.querySelector('#materialCourse').value,subject:document.querySelector('#materialSubject').value,materialType:document.querySelector('#materialType').value,topic:document.querySelector('#materialTopic').value,objectiveId:document.querySelector('#materialObjective').value,includeImages:false})});const data=await res.json();if(!res.ok)throw new Error(data.error||'No se pudo generar el material');const m=data.material?.content||{},sections=Array.isArray(m.secciones)?m.secciones:[];result.innerHTML=`<h2>${esc(m.titulo||data.material?.title||'Material educativo')}</h2><p><strong>Propósito:</strong> ${esc(m.proposito||'')}</p>${sections.map(s=>`<div class="moment"><h3>${esc(s.titulo)}</h3><p>${esc(s.contenido)}</p>${s.apoyoVisual?`<small>Apoyo visual: ${esc(s.apoyoVisual)}</small>`:''}</div>`).join('')}<p class="muted">Guardado automáticamente en Mi Carpeta.</p>`;result.classList.remove('hidden')}catch(err){msg.textContent=err.message||'Error al generar'}finally{loader.classList.add('hidden');button.disabled=false}});
async function openFolder(){homeView.classList.add('hidden');folderView.classList.remove('hidden');const msg=document.querySelector('#folderMessage');msg.textContent='Cargando Mi Carpeta…';try{const r=await fetch(API+'/api/my-folder',{credentials:'include'}),d=await r.json();if(!r.ok)throw new Error(d.error||'No se pudo cargar Mi Carpeta');folderData=d;renderFolder('plannings');msg.textContent=''}catch(e){msg.textContent=e.message}}
function renderFolder(key){const list=folderData?.[key]||[];document.querySelector('#folderList').innerHTML=list.length?list.map(x=>`<article class="folder-card"><strong>${esc(x.title)}</strong><span>${esc(x.course?.name||'')}</span><small>${new Date(x.createdAt).toLocaleDateString('es-CL')}</small></article>`).join(''):'<div class="empty">Aún no hay elementos en esta categoría.</div>'}
document.querySelectorAll('[data-folder]').forEach(b=>b.addEventListener('click',()=>renderFolder(b.dataset.folder)));document.querySelector('#folderBack').addEventListener('click',()=>{folderView.classList.add('hidden');homeView.classList.remove('hidden')});
document.querySelectorAll('[data-route]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.route==='/planificacion-docente-ia')openPlanning();else if(button.dataset.route==='/evaluaciones-con-ia')openAssessment();else if(button.dataset.route==='/material-educativo-ia')openMaterial();else if(button.dataset.route==='/?panel=mi-carpeta')openFolder();else location.href=API+button.dataset.route}));
session();
