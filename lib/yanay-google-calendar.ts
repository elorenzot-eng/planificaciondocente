import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma";

export const organizer = "contacto@educantay.cl";
export const redirectUri = "https://educantay.cl/api/yanay-commercial/google/callback";
export function credentials() {
  const id = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const secret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const encryption = process.env.YANAY_CALENDAR_ENCRYPTION_KEY;
  if (!id || !secret || !encryption) throw new Error("Configuración de calendario incompleta");
  return { id, secret, encryption };
}
export function seal(value: string, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", createHash("sha256").update(secret).digest(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}
export function unseal(value: string, secret: string) {
  const [i,t,d] = value.split(".");
  if (!i || !t || !d) throw new Error("Credencial inválida");
  const decipher = createDecipheriv("aes-256-gcm", createHash("sha256").update(secret).digest(), Buffer.from(i,"base64url"));
  decipher.setAuthTag(Buffer.from(t,"base64url"));
  return Buffer.concat([decipher.update(Buffer.from(d,"base64url")), decipher.final()]).toString("utf8");
}
export async function accessToken() {
  const {id,secret,encryption} = credentials();
  const connection = await prisma.yanayGoogleCalendarConnection.findUnique({where:{id:"primary"}});
  if (!connection) throw new Error("Calendario no autorizado");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({client_id:id,client_secret:secret,refresh_token:unseal(connection.refreshTokenEncrypted,encryption),grant_type:"refresh_token"}),
    cache:"no-store"
  });
  if (!response.ok) throw new Error("No se pudo renovar la autorización");
  const result = await response.json() as {access_token?:string};
  if (!result.access_token) throw new Error("Token de acceso ausente");
  return result.access_token;
}
