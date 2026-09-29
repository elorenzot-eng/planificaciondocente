import type { Metadata } from "next";
import SeoLanding from "../seo-landing";

export const metadata: Metadata={title:"Evaluaciones con IA para docentes",description:"Diseña instrumentos de evaluación vinculados al trabajo pedagógico y curricular. Crea pruebas, rúbricas, listas de cotejo y escalas de valoración que luego puedes revisar y editar.",alternates:{canonical:"/evaluaciones-con-ia"},openGraph:{title:"Crea evaluaciones y rúbricas con IA para tus clases",description:"Diseña instrumentos de evaluación vinculados al trabajo pedagógico y curricular. Crea pruebas, rúbricas, listas de cotejo y escalas de valoración que luego puedes revisar y editar.",url:"https://educantay.cl/evaluaciones-con-ia",type:"website"}};

export default function Page(){return <SeoLanding eyebrow="EVALUACIONES CON INTELIGENCIA ARTIFICIAL" title="Crea evaluaciones y rúbricas con IA para tus clases" description="Diseña instrumentos de evaluación vinculados al trabajo pedagógico y curricular. Crea pruebas, rúbricas, listas de cotejo y escalas de valoración que luego puedes revisar y editar." features={["Evaluaciones editables","Rúbricas","Listas de cotejo","Adecuaciones y apoyos PIE"]}/>}
