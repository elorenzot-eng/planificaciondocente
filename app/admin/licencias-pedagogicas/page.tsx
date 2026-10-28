import { redirect } from "next/navigation";
import { getSession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import PedagogicalLicensesClient from "./client";
export default async function Page(){
 const session=await getSession();
 if(!session?.id) redirect("/");
 const user=await prisma.user.findUnique({where:{id:String(session.id)},select:{role:true,active:true}});
 if(!user?.active||user.role!=="SUPERADMIN") redirect("/");
 return <PedagogicalLicensesClient/>;
}
