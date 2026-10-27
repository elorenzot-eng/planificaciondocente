"use client";
import {useEffect,useState} from "react";
import * as XLSX from "xlsx";
type Student={id:string;firstName:string;paternalSurname:string;maternalSurname:string;rut:string;course:string};
const HEADERS=["Nombres","Apellido paterno","Apellido materno","RUT","Curso"];
export default function StudentsImport({schoolId}:{schoolId:string}){
 const [rows,setRows]=useState<unknown[][]>([]);
 const [students,setStudents]=useState<Student[]>([]);
 const [issues,setIssues]=useState<{row:number;reason:string}[]>([]);
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 async function refresh(){
  if(!schoolId){setStudents([]);return;}
  const r=await fetch("/api/admin/student-import?schoolId="+encodeURIComponent(schoolId),{cache:"no-store"});
  const data=await r.json();
  if(r.ok)setStudents(data.students||[]);
  else setMessage(data.error||"No se pudo consultar estudiantes");
 }
 useEffect(()=>{void refresh()},[schoolId]);
 function downloadTemplate(){
  const sheet=XLSX.utils.aoa_to_sheet([HEADERS]);
  sheet["!cols"]=[{wch:28},{wch:23},{wch:23},{wch:18},{wch:20}];
  const book=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book,sheet,"Estudiantes");
  XLSX.writeFile(book,"plantilla-estudiantes-educantay.xlsx");
 }
 async function loadFile(file?:File){
  if(!file)return;
  setIssues([]);setMessage("");setRows([]);
  try{
   const book=XLSX.read(await file.arrayBuffer(),{type:"array",cellText:true,cellDates:false});
   const sheet=book.Sheets[book.SheetNames[0]];
   if(!sheet)throw Error("El archivo no contiene hojas");
   const data=XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,defval:"",raw:false});
   const first=(data[0]||[]).map(v=>String(v).trim().toLowerCase());
   if(HEADERS.some((header,i)=>first[i]!==header.toLowerCase()))throw Error("La primera fila debe contener: "+HEADERS.join(", "));
   if(data.length>5001)throw Error("Máximo 5000 estudiantes por importación");
   setRows(data.slice(1));
   setMessage((data.length-1)+" filas listas para validar e importar");
  }catch(e){setMessage(e instanceof Error?e.message:"Archivo inválido");}
 }
 async function importRows(){
  if(!schoolId||!rows.length)return;
  setBusy(true);setIssues([]);setMessage("");
  try{
   const r=await fetch("/api/admin/student-import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({schoolId,rows})});
   const data=await r.json();
   if(!r.ok){setIssues(data.issues||[]);throw Error(data.error+(data.duplicates?.length?" · RUT registrados: "+data.duplicates.join(", "):""));}
   setMessage("Importados "+data.imported+" estudiantes");setRows([]);await refresh();
  }catch(e){setMessage(e instanceof Error?e.message:"Error al importar");}
  finally{setBusy(false);}
 }
 return <section style={{padding:20,border:"1px solid #dbe5ec",borderRadius:14,marginTop:20}}>
  <h2>Estudiantes del colegio</h2>
  <p>Descarga la plantilla, completa nombres, apellidos, RUT y curso, y carga el Excel. Los RUT se validan antes de guardar.</p>
  <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
   <button type="button" onClick={downloadTemplate}>Descargar plantilla Excel</button>
   <label>Seleccionar Excel <input type="file" accept=".xlsx,.xls" onChange={e=>void loadFile(e.target.files?.[0])}/></label>
   <button type="button" disabled={!schoolId||!rows.length||busy} onClick={()=>void importRows()}>{busy?"Importando…":"Importar estudiantes"}</button>
  </div>
  {message&&<p role="status">{message}</p>}
  {!!issues.length&&<div role="alert"><strong>Errores en la planilla:</strong><ul>{issues.slice(0,30).map((item,i)=><li key={i}>Fila {item.row}: {item.reason}</li>)}</ul>{issues.length>30&&<p>Hay {issues.length-30} errores adicionales.</p>}</div>}
  <p><strong>{students.length}</strong> estudiantes registrados</p>
  <div style={{overflowX:"auto"}}><table style={{width:"100%",textAlign:"left",borderCollapse:"collapse"}}><thead><tr>{[...HEADERS].map(h=><th key={h} style={{padding:8,borderBottom:"1px solid #ddd"}}>{h}</th>)}</tr></thead><tbody>{students.map(s=><tr key={s.id}>{[s.firstName,s.paternalSurname,s.maternalSurname,s.rut,s.course].map((value,i)=><td key={i} style={{padding:8,borderBottom:"1px solid #eee"}}>{value}</td>)}</tr>)}</tbody></table></div>
 </section>;
}
