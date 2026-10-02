const API='https://educantay.cl';
const loginView=document.querySelector('#loginView');
const homeView=document.querySelector('#homeView');
const message=document.querySelector('#loginMessage');
const planningView=document.querySelector('#planningView');
let planningData=null;
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
document.querySelectorAll('[data-route]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.route==='/planificacion-docente-ia')openPlanning();else location.href=API+button.dataset.route}));
session();
