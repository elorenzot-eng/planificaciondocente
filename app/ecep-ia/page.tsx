import {redirect} from "next/navigation";

/** ECEP IA opens with the level and specialty catalog. */
export default function EcepHome(){
  redirect("/ecep-ia/temarios");
}
