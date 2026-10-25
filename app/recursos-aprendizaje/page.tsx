"use client";
import { useEffect, useMemo, useState } from "react";
import { curriculumOA } from "../../lib/curriculum";

type ModuleKey = "simce-lectura" | "simce-matematica" | "precursores" | "cuadernillos" | "fluidez" | "reforzamiento";
const modules: { id: ModuleKey; title: string; grade: string; description: string }[] = [
  { id: "simce-lectura", title: "Ensayos tipo SIMCE — Lectura", grade: "4° básico a 2° medio", description: "Diagnóstico, práctica y simulacro" },
  { id: "simce-matematica", title: "Ensayos tipo SIMCE — Matemática", grade: "4° básico a 2° medio", description: "Problemas por eje curricular" },
];
const visualSymbols: Record<string,string> = {sol:"☀️",gato:"🐈",perro:"🐕",pájaro:"🐦",pajaro:"🐦",luna:"🌙",casa:"🏠",árbol:"🌳",arbol:"🌳",flor:"🌸",manzana:"🍎",pelota:"⚽",pez:"🐟",libro:"📖",mariposa:"🦋",estrella:"⭐",auto:"🚗",coche:"🚗",carro:"🚗",tren:"🚂",barco:"⛵",conejo:"🐇",elefante:"🐘",ratón:"🐁",raton:"🐁",mesa:"🪑",taza:"☕",plátano:"🍌",platano:"🍌",zapato:"👟",corazón:"❤️",corazon:"❤️",mano:"✋",ojo:"👁️",oreja:"👂",nube:"☁️",llave:"🔑",reloj:"🕒",avión:"✈️",avion:"✈️",bicicleta:"🚲",abeja:"🐝",oso:"🐻",león:"🦁",leon:"🦁",pato:"🦆",vaca:"🐄",caballo:"🐎",oveja:"🐑",cerdo:"🐖",rana:"🐸",tortuga:"🐢",serpiente:"🐍",uva:"🍇",naranja:"🍊",limón:"🍋",limon:"🍋",sandía:"🍉",sandia:"🍉",zanahoria:"🥕",pan:"🍞",queso:"🧀",leche:"🥛",huevo:"🥚",helado:"🍦",regalo:"🎁",globo:"🎈",lápiz:"✏️",lapiz:"✏️",tijeras:"✂️",mochila:"🎒"};
function pictureForWord(word:string):string|null {const plain=String(word||"").toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();const entry=Object.entries(visualSymbols).find(([key])=>key.normalize("NFD").replace(/[\u0300-\u036f]/g,"")===plain);return entry?.[1]||null;}
function findVisual(stimulus:string):string|null {
  const normalized=stimulus.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const imageContext=/(imagen|ilustracion|dibujo|figura|observa|mira|representa)/.test(normalized);
  if(!imageContext) return null;
  const entries=Object.entries(visualSymbols);
  const found=entries.sort((a,b)=>b[0].length-a[0].length).find(([word])=>{
    const plain=word.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    return new RegExp(`(^|[^a-z])${plain}(?=[^a-z]|$)`,"i").test(normalized);
  });
  return found?.[1]||null;
}

export default function RecursosAprendizajePage() {
  const [moduleId, setModuleId] = useState<ModuleKey>("simce-lectura");
  const [grade, setGrade] = useState("4");
  useEffect(() => { const q = new URLSearchParams(window.location.search); const m=q.get("modulo"); const g=q.get("nivel"); if (m && modules.some(x=>x.id===m)) setModuleId(m as ModuleKey); if(["4","6","8","10"].includes(g||"")) setGrade(g!); }, []);
  const [printBubbleSheet, setPrintBubbleSheet] = useState(false);
  const [difficulty, setDifficulty] = useState("Intermedio");
  const [quantity, setQuantity] = useState(10);
  const [oa, setOa] = useState("");
  const [selectedOaIds, setSelectedOaIds] = useState<string[]>([]);
  const [customOaText, setCustomOaText] = useState("");
  const [selectedCustomOa, setSelectedCustomOa] = useState<number[]>([]);
  const customOaLines = useMemo(()=>customOaText.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,30),[customOaText]);
  const [mode, setMode] = useState("Práctica");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [resource, setResource] = useState<any>(null);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [saved, setSaved] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [printTeacher, setPrintTeacher] = useState(false);
  const [answers, setAnswers] = useState<Record<number,string>>({});
  async function loadSaved() {
    setError("");
    try {
      const response = await fetch("/api/recursos-aprendizaje", {cache:"no-store"});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudieron cargar los recursos");
      setSaved(data.resources || []); setShowSaved(true);
    } catch(e) { setError(e instanceof Error ? e.message : "Error de consulta"); }
  }
  function editActivity(index:number, field:string, value:string) {
    setResource((current:any) => ({...current,activities:current.activities.map((a:any,i:number)=>i===index?{...a,[field]:value}:a)}));
    setSavedMessage("");
  }
  function printVersion(teacher:boolean) {
    setPrintTeacher(teacher);
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }
  async function saveResource() {
    if (!resource) return;
    setSaving(true); setError(""); setSavedMessage("");
    try {
      const response = await fetch("/api/recursos-aprendizaje", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:resourceId,moduleId,grade,content:resource})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No fue posible guardar");
      if (data.resource?.id) setResourceId(data.resource.id);
      setSavedMessage("Borrador guardado correctamente.");
      if (showSaved) await loadSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Error al guardar"); }
    finally { setSaving(false); }
  }
  async function generate() {
    setLoading(true); setError(""); setSavedMessage(""); setResource(null); setResourceId(null);
    try {
      const response = await fetch("/api/recursos-aprendizaje/generar", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({moduleId,grade,difficulty,quantity,oa: moduleId.startsWith("simce") ? availableOA.map(x=>`${x.code} (${x.axis}): ${x.text}`).join("\n") : "",mode}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error de generación");
      setResource(data.resource);setAnswers({});
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo generar"); }
    finally { setLoading(false); }
  }
  const selected = useMemo(() => modules.find(m => m.id === moduleId)!, [moduleId]);
  const availableOA = useMemo(() => curriculumOA.filter(x => x.level === (grade==="10"?"2° Medio":`${grade}° Básico`) && x.subject === (moduleId === "simce-matematica" ? "Matemática" : "Lenguaje y Comunicación / Lengua y Literatura") && x.status === "official"), [grade,moduleId]);
  useEffect(()=>{setSelectedOaIds([]);setSelectedCustomOa([]);setCustomOaText("");},[grade,moduleId]);
  return <main className="ea-resource-config" style={{ width:"100%", maxWidth: 1100, margin: "0 auto", padding: "32px 20px", fontFamily: "system-ui, sans-serif", color: "#15324b", boxSizing:"border-box" }}>
    <a className="no-print" href={moduleId.startsWith("simce") ? "/ensayos-simce" : "/ensayos-simce"} style={{ color: "#007e90" }}>← {moduleId.startsWith("simce") ? "Volver a los niveles" : "Volver a ensayos SIMCE"}</a>
    <style>{`@keyframes eaSimceSpin {to{transform:rotate(360deg)}} .ea-simce-spinner{animation:eaSimceSpin 1s linear infinite} .ea-resource-config .ea-config-section {display:block!important;width:100%!important;max-width:none!important;box-sizing:border-box!important;clear:both!important} .ea-resource-config .ea-config-layout {display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important;width:100%!important;align-items:stretch!important} .ea-resource-config .ea-config-tile {display:flex!important;flex-direction:column!important;justify-content:center!important;min-width:0!important;min-height:140px!important;padding:18px!important;border-radius:14px!important;box-sizing:border-box!important} .ea-resource-config .ea-config-tile label {display:block!important;width:100%!important;font-size:15px!important;font-weight:600!important} .ea-resource-config .ea-config-tile select,.ea-resource-config .ea-config-tile input {display:block!important;width:100%!important;box-sizing:border-box!important;margin-top:10px!important;padding:12px!important;border:1px solid #cbdce6!important;border-radius:9px!important;background:#fff!important;font-size:16px!important} .ea-resource-config .ea-config-title {font-size:22px!important;line-height:1.35!important;margin:0 0 16px!important} @media(max-width:800px){.ea-resource-config .ea-config-layout{grid-template-columns:repeat(2,minmax(0,1fr))!important}} @media(max-width:520px){.ea-resource-config .ea-config-layout{grid-template-columns:1fr!important}} .ea-resource-config {display:block!important;width:100%!important;max-width:1100px!important;box-sizing:border-box!important} .ea-resource-config > h1,.ea-resource-config > p,.ea-resource-config > div,.ea-resource-config > section {display:block;width:100%;box-sizing:border-box} .ea-resource-config .ea-config-section {display:block!important;width:100%!important;max-width:none!important;box-sizing:border-box!important} .ea-resource-config .ea-config-controls {display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:18px!important;width:100%!important} .ea-resource-config .ea-config-controls label {display:block!important;min-width:0!important;width:100%!important} .ea-resource-config .ea-config-controls input,.ea-resource-config .ea-config-controls select {width:100%!important;max-width:100%!important;box-sizing:border-box!important} @media(max-width:600px){.ea-resource-config .ea-config-controls {grid-template-columns:1fr!important}} @page { size:A4; margin:16mm; } @media print { .ea-resource-config::after {content:none!important;display:none!important} .ea-bubble-sheet{break-before:page;page-break-before:always} .ea-bubble-sheet h2{font-size:18pt} } @media print { body { background:white !important; } .workbook-cover { min-height:245mm; break-after:page; page-break-after:always; display:flex !important; flex-direction:column; justify-content:space-between; } .workbook-activity { break-inside:avoid; page-break-inside:avoid; } .workbook-instructions { break-after:page; page-break-after:always; } .workbook-cover h2 { font-size:32pt; } .workbook-answer-space { min-height:65px; border-bottom:1px solid #aaa; } } @media print { .no-print { display:none !important; } main { max-width:none !important; padding:0 !important; } .print-content { border:none !important; margin:0 !important; padding:0 !important; } .print-answers { display:${printTeacher ? "block" : "none"} !important; } .print-answers details { display:block; } .print-answers summary { display:none; } .print-answers details > * { display:block; } .ea-resource-config .workbook-activity{padding:5px 2px!important;margin:0!important;line-height:1.18!important;font-size:10pt!important;break-inside:avoid!important;page-break-inside:avoid!important} .ea-resource-config .workbook-activity h4{font-size:10pt!important;line-height:1.18!important;margin:3px 0!important} .ea-resource-config .workbook-activity p{margin:3px 0!important;line-height:1.18!important} .ea-resource-config .workbook-activity ol{margin:3px 0 4px!important;padding-left:25px!important} .ea-resource-config .workbook-activity li{padding:1px 0!important;line-height:1.18!important} .ea-resource-config article.print-content>p{margin:5px 0!important;line-height:1.2!important} .ea-resource-config article.print-content h3{margin:4px 0 8px!important;font-size:14pt!important} } @media print { .ea-resource-config article.print-content .simce-question:not(:first-of-type):nth-of-type(5n+1){break-before:page!important;page-break-before:always!important} .ea-resource-config article.print-content .simce-question{break-inside:avoid!important;page-break-inside:avoid!important} .ea-resource-config article.print-content .simce-question{min-height:47mm!important;padding:6mm 3mm!important;box-sizing:border-box!important;border-bottom:1px solid #cdd7df!important;font-size:10.5pt!important;line-height:1.3!important} .ea-resource-config article.print-content .simce-question:nth-of-type(-n+5){min-height:40mm!important;padding:3mm 3mm!important} .ea-resource-config article.print-content .simce-question h4{font-size:11pt!important;margin:0 0 2mm!important;line-height:1.25!important} .ea-resource-config article.print-content .simce-question p{margin:1.5mm 0!important;line-height:1.25!important} .ea-resource-config article.print-content .simce-question ol{margin:2mm 0!important;padding-left:8mm!important} .ea-resource-config article.print-content .simce-question li{line-height:1.3!important;padding:0.5mm 0!important} } @media print { .ea-resource-config article.print-content .simce-page-group{display:flex!important;flex-direction:column!important;justify-content:space-between!important;min-height:246mm!important;break-after:page!important;page-break-after:always!important;break-inside:avoid!important} .ea-resource-config article.print-content .simce-first-group{min-height:197mm!important} .ea-resource-config article.print-content .simce-page-group .simce-question{min-height:0!important;flex:0 0 auto!important;padding:2mm 2mm!important;margin:0!important;break-before:auto!important;page-break-before:auto!important} .ea-resource-config article.print-content .simce-page-group .simce-question:nth-of-type(-n+5){min-height:0!important;padding:2mm 2mm!important} } @media print { .ea-resource-config article.print-content .workbook-cover{min-height:240mm!important;break-after:page!important} .ea-resource-config article.print-content .workbook-instructions{break-after:auto!important;page-break-after:auto!important;margin:12mm 0!important} .ea-resource-config article.print-content .workbook-activity:not(.simce-question){padding:7mm 2mm!important;font-size:12pt!important;line-height:1.5!important} .ea-resource-config article.print-content .workbook-activity:not(.simce-question) p{line-height:1.5!important;margin:3mm 0!important} .ea-resource-config article.print-content .workbook-activity:not(.simce-question) li{line-height:1.5!important;padding:2mm 0!important} .ea-resource-config article.print-content .fluency-record{break-inside:avoid!important;font-size:10pt!important;line-height:1.5!important} } .ea-resource-config .ea-visual-options{display:flex;justify-content:space-around;gap:12px;margin:10px 0 14px}.ea-resource-config .ea-visual-option{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:17px}.ea-resource-config .ea-visual-option span:last-child{font-size:66px;line-height:1.25}.ea-resource-config .ea-match-pairs{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:12px 0}.ea-resource-config .ea-match-pairs p{display:flex;align-items:center;gap:14px;min-height:65px}.ea-resource-config .ea-match-pairs p span[role="img"]{font-size:54px} @media print{.ea-resource-config article.print-content .ea-visual-option span:last-child{font-size:53pt}.ea-resource-config article.print-content .ea-match-pairs p span[role="img"]{font-size:44pt}.ea-resource-config article.print-content .ea-visual-options,.ea-resource-config article.print-content .ea-match-pairs{break-inside:avoid!important}} .ea-resource-config .ea-workbook-visual{display:flex;align-items:center;justify-content:center;width:190px;height:165px;margin:6px auto 10px;border:0;background:transparent;border-radius:0;box-shadow:none;font-size:100px;line-height:1} @media print { .ea-resource-config article.print-content .workbook-cover{min-height:0!important;height:auto!important;display:block!important;break-after:auto!important;page-break-after:auto!important;padding:4mm 0 7mm!important;border-bottom:2px solid #b8d8e8!important;margin-bottom:6mm!important} .ea-resource-config article.print-content .workbook-cover h2{font-size:19pt!important;margin:3mm 0!important} .ea-resource-config article.print-content .workbook-cover h3{font-size:12pt!important;margin:1mm 0!important} .ea-resource-config article.print-content .workbook-cover p{font-size:12pt!important;margin:2mm 0!important} .ea-resource-config article.print-content .workbook-instructions{margin:4mm 0!important;padding:3mm 0!important;break-after:auto!important;page-break-after:auto!important} .ea-resource-config article.print-content .workbook-instructions h3{font-size:13pt!important;margin:1mm 0!important} .ea-resource-config article.print-content .workbook-instructions p{font-size:11pt!important;line-height:1.4!important;margin:2mm 0!important} .ea-resource-config article.print-content .ea-workbook-visual{width:43mm;height:39mm;font-size:78pt;margin:2mm auto 3mm!important;print-color-adjust:exact;-webkit-print-color-adjust:exact} } @media print { .ea-resource-config .no-print,.ea-resource-config .ea-config-layout,.ea-resource-config .ea-config-tile,.ea-resource-config .ea-config-controls,.ea-resource-config .ea-config-title,.ea-resource-config .ea-config-section > h2,.ea-resource-config > h1,.ea-resource-config > p {display:none!important;visibility:hidden!important} .ea-resource-config .ea-config-section{margin:0!important;padding:0!important;border:0!important;background:transparent!important} .ea-resource-config article.print-content{display:block!important;margin:0!important;padding:0!important;border:0!important;background:white!important} .ea-resource-config article.print-content .workbook-activity{padding:3px 0!important;margin:0!important;line-height:1.12!important;font-size:9.5pt!important} .ea-resource-config article.print-content .workbook-activity h4{margin:2px 0!important;font-size:9.5pt!important;line-height:1.12!important} .ea-resource-config article.print-content .workbook-activity p{margin:2px 0!important;line-height:1.12!important} .ea-resource-config article.print-content .workbook-activity ol{margin:2px 0!important;padding-left:23px!important} .ea-resource-config article.print-content .workbook-activity li{padding:0!important;margin:0!important;line-height:1.15!important} .ea-resource-config article.print-content .workbook-activity{break-inside:avoid-page!important} .ea-resource-config article.print-content > div:first-child > div > p:first-child{display:none!important} .ea-resource-config::after,.ea-resource-config::before{content:none!important;display:none!important} }`}</style>
    <style>{`@media print {
      /* SIMCE: encabezado y primeras preguntas deben compartir la primera página. */
      .ea-resource-config article.print-content .simce-page-group {
        display:block!important;
        min-height:0!important;
        height:auto!important;
        break-inside:auto!important;
        page-break-inside:auto!important;
        break-after:auto!important;
        page-break-after:auto!important;
      }
      .ea-resource-config article.print-content .simce-first-group {
        min-height:0!important;
        break-before:auto!important;
        page-break-before:auto!important;
      }
      .ea-resource-config article.print-content .simce-question {
        min-height:0!important;
        height:auto!important;
        break-inside:avoid!important;
        page-break-inside:avoid!important;
      }
      .ea-resource-config article.print-content > p {break-after:auto!important;page-break-after:auto!important}
    }`}</style>
    <h1 className="no-print">{moduleId.startsWith("simce") ? `Ensayo SIMCE · ${moduleId==="simce-lectura"?"Lectura":"Matemática"} · ${grade==="10"?"2° medio":`${grade}° básico`}` : selected.title}</h1>
    <p className="no-print">Selecciona la dificultad y la cantidad de preguntas para generar tu recurso.</p>
    <div className="no-print"><button type="button" onClick={loadSaved}>Ver mis recursos guardados</button>
      {showSaved && <section aria-label="Mis recursos guardados"><h2>Mis recursos guardados</h2>
        {saved.length===0 && <p>No hay recursos guardados.</p>}
        {saved.map(item => <button key={item.id} type="button" onClick={() => {setResource(item.content);setAnswers({});setResourceId(item.id);setModuleId(item.moduleId);setGrade(item.grade==="2° medio"?"10":(["4","6","8"].find(g=>item.grade===`${g}° básico`)||"4"));setSavedMessage("");}} style={{display:"block",margin:"8px 0",padding:10}}>{item.title} · {item.grade}</button>)}
      </section>}
    </div>
    <div className="no-print" style={{ display: "none", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
      {modules.map(m => <button key={m.id} onClick={() => setModuleId(m.id)} aria-pressed={moduleId === m.id} style={{ textAlign: "left", border: moduleId === m.id ? "2px solid #00a6a6" : "1px solid #d6e1e7", background: moduleId === m.id ? "#eaf8f8" : "white", borderRadius: 14, padding: 18, cursor: "pointer", color: "inherit" }}>
        <strong>{m.title}</strong><div style={{ marginTop: 8 }}>{m.grade}</div><small>{m.description}</small>
      </button>)}
    </div>
    <section className="print-content ea-config-section" style={{ width:"100%", boxSizing:"border-box", marginTop: 28, padding: 22, border: "1px solid #d6e1e7", borderRadius: 14 }}>
      <h2 className="no-print ea-config-title">{moduleId.startsWith("simce") ? `Ensayo SIMCE · ${moduleId==="simce-lectura"?"Lectura":"Matemática"} · ${grade==="10"?"2° medio":`${grade}° básico`}` : selected.title}</h2>
      <div className="no-print ea-config-layout">
        <div className="ea-config-tile" style={{background:"#eff8fd",borderLeft:"5px solid #0ea5e9"}}>
          <label>Dificultad<select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>Inicial</option><option>Intermedio</option><option>Avanzado</option><option>Mixta</option></select></label>
        </div>
        <div className="ea-config-tile" style={{background:"#f8f3fd",borderLeft:"5px solid #9855d4"}}>
          <label>Cantidad de preguntas<input type="number" min={1} max={40} value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(40,Number(e.target.value)||1)))}/></label>
        </div>
        <div className="ea-config-tile" style={{background:"#effbf6",borderLeft:"5px solid #12b981"}}>
          <strong style={{fontSize:16}}>{moduleId.startsWith("simce") ? "Ensayo automático por nivel" : "Cuadernillo automático de 2° básico"}</strong>
          <span style={{fontSize:13,lineHeight:1.5,marginTop:8}}>{moduleId.startsWith("simce") ? "EducAntay distribuye las preguntas por habilidades y ejes curriculares. No necesitas seleccionar OA." : "EducAntay genera el cuadernillo automáticamente según el modelo pedagógico precargado. No necesitas seleccionar OA."}</span>
        </div>
      </div>

      <p className="no-print" style={{ marginTop: 20, background: "#f2f6f8", padding: 14, borderRadius: 10 }}><strong>Vista previa de configuración:</strong> {grade==="10"?"2° medio":`${grade}° básico`} · {difficulty} · {quantity} preguntas{moduleId.startsWith("simce") ? `` : ""}.</p>
      <div className="no-print" style={{display:"flex",alignItems:"center",gap:22,flexWrap:"wrap",marginTop:12}}>
        <button type="button" disabled={loading} onClick={generate} style={{padding:"12px 20px",borderRadius:10,cursor:loading?"wait":"pointer"}}>{loading ? (moduleId.startsWith("simce") ? "Generando ensayo SIMCE…" : "Generando recurso IA…") : "Generar con IA"}</button>
        {moduleId.startsWith("simce") && <label style={{display:"inline-flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:15,fontWeight:500}}><input type="checkbox" checked={printBubbleSheet} onChange={e=>setPrintBubbleSheet(e.target.checked)} style={{width:18,height:18,margin:0,flexShrink:0}}/> Incluir hoja de respuestas con óvalos (A, B, C y D)</label>}
      </div>

      {loading && <div className="no-print" role="status" aria-live="polite" style={{marginTop:14,padding:18,background:"#eff8fd",borderLeft:"5px solid #0ea5e9",borderRadius:12,display:"flex",alignItems:"center",gap:12}}><span className="ea-simce-spinner" aria-hidden="true" style={{width:22,height:22,border:"3px solid #b9e7fa",borderTopColor:"#0ea5e9",borderRadius:"50%",display:"inline-block"}}/><span><strong>{moduleId.startsWith("simce")?"Generando ensayo SIMCE con IA":"Generando recurso con IA"}</strong><span style={{display:"block",fontSize:13,marginTop:3}}>Preparando preguntas, respuestas y tabla de especificaciones. Espera a que finalice el proceso.</span></span></div>}
      {error && <p role="alert" style={{ color: "#ad2828" }}>{error}</p>}

      {resource && <article className="print-content" style={{ marginTop: 20, padding: 18, border: "1px solid #d6e1e7", borderRadius: 12 }}>
        <div className={moduleId==="precursores"||moduleId==="cuadernillos"||moduleId==="fluidez"?"workbook-cover":""}><div><p className={moduleId.startsWith("simce")?"no-print":""} style={{fontWeight:700,color:"#008f98",letterSpacing:2}}>EDUCANTAY · RECURSOS DE APRENDIZAJE</p><h3>{resource.title}</h3>{(moduleId==="precursores"||moduleId==="cuadernillos"||moduleId==="fluidez") && <><h2 style={{fontSize:30,color:"#15324b"}}>CUADERNILLO DE {moduleId==="precursores"?"PRECURSORES DE LA LECTURA":moduleId==="fluidez"?"FLUIDEZ LECTORA":"COMPRENSIÓN DE LECTURA"}</h2><p style={{fontSize:26,color:"#00a6a6",fontWeight:700}}>2° básico</p></>}</div>{(moduleId==="precursores"||moduleId==="cuadernillos"||moduleId==="fluidez") && <div><p>Mi nombre es: ____________________________________</p><p>Mi curso es: __________________</p></div>}</div>{(moduleId==="precursores"||moduleId==="cuadernillos") && resource.studentInstructions && <section className="workbook-instructions"><h3>INSTRUCCIONES</h3><p style={{whiteSpace:"pre-wrap",lineHeight:1.8}}>{resource.studentInstructions}</p></section>}<p>{resource.introduction}</p>
        <div className="no-print"><label>Título editable <input value={resource.title || ""} onChange={e=>{setResource({...resource,title:e.target.value});setSavedMessage("");}} /></label></div>
        {(moduleId.startsWith("simce") ? Array.from({length:Math.ceil((resource.activities?.length||0)/5)},(_:unknown,g:number)=>resource.activities.slice(g*5,g*5+5)) : [resource.activities||[]]).map((group:any[],groupIndex:number)=><div className={moduleId.startsWith("simce") ? `simce-page-group ${groupIndex===0 ? "simce-first-group" : ""}` : ""}>{group.map((a:any,localIndex:number)=>{const i=groupIndex*5+localIndex;return <section key={i} className={`workbook-activity${moduleId.startsWith("simce") ? " simce-question" : ""}`} style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
          {(moduleId==="cuadernillos"||moduleId==="reforzamiento") && a.passageId && resource.passages?.find((p:any)=>p.id===a.passageId) && !resource.activities.slice(0,i).some((prev:any)=>prev.passageId===a.passageId) && <div style={{border:"1px solid #a9c9d2",borderRadius:14,padding:20,marginBottom:18,background:"#fff"}}><p style={{color:"#007e90",fontWeight:700}}>Lee el siguiente texto y responde las preguntas.</p><h3>{resource.passages.find((p:any)=>p.id===a.passageId).title}</h3><p style={{whiteSpace:"pre-wrap",lineHeight:1.8,fontSize:17}}>{resource.passages.find((p:any)=>p.id===a.passageId).text}</p>{resource.passages.find((p:any)=>p.id===a.passageId).illustrationDescription && <p className="no-print" style={{fontSize:12,color:"#6b7280"}}>Ilustración pendiente: {resource.passages.find((p:any)=>p.id===a.passageId).illustrationDescription}</p>}</div>}
          <h4>{moduleId.startsWith("simce") ? `Pregunta ${i+1}` : `Actividad ${i+1}: ${a.skill}`}</h4>{a.stimulus && !(moduleId==="precursores" && /imagen|ilustraci[oó]n|dibujo/i.test(a.stimulus)) && <p>{a.stimulus}</p>}<p><strong>{a.question}</strong></p>{moduleId==="precursores" && a.stimulus && /imagen|ilustraci[oó]n|dibujo/i.test(a.stimulus) && <div className="ea-workbook-visual" role="img" aria-label={a.stimulus}>{findVisual(a.stimulus)||"🖼️"}</div>}
          
          {moduleId==="precursores" && a.activityType==="seleccion_imagen" && Array.isArray(a.visualOptions) && a.visualOptions.length===3 ? <div className="ea-visual-options">{a.visualOptions.map((word:string,j:number)=><div key={j} className="ea-visual-option"><span>{String.fromCharCode(65+j)}</span><span role="img" aria-label={word}>{pictureForWord(word)||"?"}</span></div>)}</div> : moduleId==="precursores" && a.activityType==="asociacion" && Array.isArray(a.pairs) && a.pairs.length>0 ? <div className="ea-match-pairs"><div>{a.pairs.map((pair:any,j:number)=><p key={j}>{j+1}. {pair.word} <span>___________</span></p>)}</div><div>{[...a.pairs].reverse().map((pair:any,j:number)=><p key={j}><span>{String.fromCharCode(65+j)}.</span> <span role="img" aria-label={pair.image}>{pictureForWord(pair.image)||"?"}</span></p>)}</div></div> : a.options?.length > 0 && <ol type="A">{a.options.map((option:string,j:number)=><li key={j} style={{padding:"6px 0"}}>{option}</li>)}</ol>}{(moduleId==="cuadernillos"||moduleId==="precursores"||moduleId==="reforzamiento") && a.options?.length===0 && <div className="workbook-answer-space" aria-label="Espacio para respuesta escrita"/>}
          {moduleId==="fluidez" && <div className="fluency-record" style={{marginTop:14,padding:12,border:"1px solid #b6d4dc",borderRadius:8}}>
            <strong>Registro de fluidez lectora · uso docente</strong>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12,marginTop:10}}>
              <span>Fecha: __________________</span><span>Tiempo (segundos): __________</span>
              <span>Palabras leídas: __________</span><span>Errores de lectura: __________</span>
              <span>Palabras correctas: __________</span><span>Palabras correctas/minuto: __________</span>
            </div>
            <p style={{marginTop:12}}>Observaciones: ____________________________________________________</p>
          </div>}
          {moduleId.startsWith("simce") && <div className="no-print"><label>Respuesta del estudiante <select value={answers[i]||""} onChange={e=>setAnswers(prev=>({...prev,[i]:e.target.value}))}><option value="">Sin responder</option>{(a.options||[]).map((option:string,j:number)=><option key={j} value={option}>{String.fromCharCode(65+j)}. {option}</option>)}</select></label></div>}
          <div className="print-answers"><details open><summary>Respuesta y orientación docente</summary><p>{a.correctAnswer}</p><p>{a.explanation}</p></details></div>
        </section>})}</div>)}
        {moduleId.startsWith("simce") && <section className="no-print" style={{padding:16,background:"#eff7f8",borderRadius:12,marginTop:18}}>
          <h3>Corrección del ensayo</h3>
          <p>Respuestas correctas: {resource.activities.filter((a:any,i:number)=>answers[i] && answers[i]===a.correctAnswer).length} / {resource.activities.length}</p>
          <p>Logro: {Math.round(100*resource.activities.filter((a:any,i:number)=>answers[i] && answers[i]===a.correctAnswer).length/resource.activities.length)}%</p>
          <p>Preguntas respondidas: {resource.activities.filter((_:any,i:number)=>Boolean(answers[i])).length} / {resource.activities.length}</p>
           <h4>Resultados por habilidad</h4>
           <ul>{Array.from(new Set<string>(resource.activities.map((a:any)=>String(a.skill||"Sin habilidad definida")))).map((skill:string)=>{
             const items=resource.activities.map((a:any,i:number)=>({...a,answerIndex:i})).filter((a:any)=>String(a.skill||"Sin habilidad definida")===skill);
             const correct=items.filter((a:any)=>answers[a.answerIndex]===a.correctAnswer).length;
             return <li key={skill}>{skill}: {correct}/{items.length} ({Math.round(100*correct/items.length)}%)</li>;
           })}</ul>
           <small>Resultado del ensayo, no puntaje oficial SIMCE. Preguntas sin responder cuentan como incorrectas.</small>
        </section>}
        {moduleId.startsWith("simce") && Array.isArray(resource.specificationTable) && <section className="print-answers" style={{marginTop:18}}><h3>Hoja de respuestas del docente — habilidades y ejes curriculares</h3><p>Clave de corrección, habilidad evaluada, eje curricular y referencia OA de cada pregunta. Documento de uso docente, no puntaje oficial SIMCE.</p><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{["Ítem","Eje curricular","OA / referencia curricular","Habilidad evaluada","Dificultad","Puntos","Respuesta correcta"].map(x=><th key={x} style={{border:"1px solid #ccc",padding:5}}>{x}</th>)}</tr></thead><tbody>{resource.specificationTable.map((r:any,i:number)=><tr key={i}>{[r.number,r.curricularAxis,r.learningObjective,r.skill,r.difficulty,r.points,r.correctAnswer].map((v:any,j:number)=><td key={j} style={{border:"1px solid #ccc",padding:5}}>{v}</td>)}</tr>)}</tbody></table></div></section>}
        <div className="print-answers"><p>{resource.teacherNotes}</p></div>
        {moduleId.startsWith("simce") && printBubbleSheet && <section className="ea-bubble-sheet" aria-label="Hoja de respuestas con óvalos" style={{background:"#fff",padding:24,marginTop:20}}>
          <h2 style={{textAlign:"center",color:"#15324b"}}>HOJA DE RESPUESTAS · ENSAYO SIMCE</h2>
          <p style={{textAlign:"center"}}>{moduleId==="simce-lectura"?"Lectura":"Matemática"} · {grade==="10"?"2° medio":`${grade}° básico`}</p>
          <div style={{display:"grid",gap:12,margin:"25px 0"}}><div>Nombre completo: __________________________________________________</div><div>Curso: ________________________ &nbsp; RUT: ______________________________</div></div>
          <p style={{fontSize:13}}>Marca completamente un solo óvalo por pregunta.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"10px 28px"}}>
            {(resource.activities||[]).map((_:any,i:number)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #d6e1e7",padding:"9px 4px",breakInside:"avoid"}}><strong>{i+1}.</strong><span style={{display:"flex",gap:14}}>{["A","B","C","D"].map(letter=><span key={letter} style={{whiteSpace:"nowrap",fontSize:14}}><span style={{display:"inline-block",border:"1.5px solid #15324b",borderRadius:"50%",width:18,height:18,verticalAlign:"middle",marginRight:4}}/> {letter}</span>)}</span></div>)}
          </div>
        </section>}

        <div className="no-print"><button type="button" disabled={saving} onClick={saveResource}>{saving ? "Guardando…" : "Guardar borrador"}</button>{" "}
        <button type="button" onClick={() => printVersion(false)}>Imprimir estudiante / guardar PDF</button>{" "}
        <button type="button" onClick={() => printVersion(true)}>Imprimir profesor / guardar PDF</button>
        {savedMessage && <p role="status">{savedMessage}</p>}</div>
      </article>}
      <p className="no-print"><small>Los ensayos tipo SIMCE son originales y no oficiales. La exportación PDF se realiza mediante la opción «Guardar como PDF» del navegador. Los resultados por estudiante aún no están disponibles.</small></p>
    </section>
  </main>;
}
