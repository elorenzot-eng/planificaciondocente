"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import StudentsImport from "../../components/StudentsImport";
type School={id:string;name:string;rbd:string|null};
export default function AdminStudentsPage(){
 const [schools,setSchools]=useState<School[]>([]);
 const [schoolId,setSchoolId]=useState("");
 const [error,setError]=useState("");
 useEffect(()=>{
  (async()=>{
   try{
    const response=await fetch("/api/admin",{cache:"no-store"});
    const data=await response.json();
    if(!response.ok)throw Error(data.error||"No autorizado");
    const organizations=Array.isArray(data.organizations)?data.organizations:[];
    const available:School[]=organizations.flatMap((o:{schools?:School[]})=>o.schools||[]);
    setSchools(available);
    setSchoolId(available.length===1?available[0].id:"");
   }catch(e){setError(e instanceof Error?e.message:"Error de acceso");}
  })();
 },[]);
 return <main style={{maxWidth:1100,margin:"0 auto",padding:28,fontFamily:"system-ui",color:"#19364c"}}>
  <Link href="/">← Volver a Administración</Link>
  <h1>Administración de estudiantes</h1>
  <p>Importa estudiantes por colegio desde una plantilla Excel y consulta la nómina registrada.</p>
  {error&&<p role="alert" style={{color:"#b91c1c"}}>{error}</p>}
  <label htmlFor="school">Establecimiento</label>
  <select id="school" value={schoolId} onChange={e=>setSchoolId(e.target.value)} style={{display:"block",padding:12,width:"100%",maxWidth:540,marginTop:8}}>
   <option value="">Selecciona un colegio</option>
   {schools.map(s=><option key={s.id} value={s.id}>{s.name}{s.rbd?" · RBD "+s.rbd:""}</option>)}
  </select>
  {schoolId&&<StudentsImport key={schoolId} schoolId={schoolId}/>}
 </main>;
}
