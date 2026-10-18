import {NextResponse} from "next/server";
import {getSession} from "../../../lib/auth";
import {officialRubricCoverage} from "../../../lib/portfolio-official-2026";

export async function GET(){
 const session=await getSession();
 if(!session?.id)return NextResponse.json({error:"Inicia sesión"},{status:401});
 return NextResponse.json({year:2026,groups:officialRubricCoverage(),note:"Estado técnico de verificación. No constituye una evaluación docente oficial.",matchEnabled:false},{headers:{"Cache-Control":"no-store"}});
}
