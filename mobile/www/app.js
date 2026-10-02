const API='https://educantay.cl';
const loginView=document.querySelector('#loginView');
const homeView=document.querySelector('#homeView');
const message=document.querySelector('#loginMessage');
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
document.querySelectorAll('[data-route]').forEach(button=>button.addEventListener('click',()=>location.href=API+button.dataset.route));
session();
