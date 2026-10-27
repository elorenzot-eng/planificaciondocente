import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

const kinds = ["planning", "assessment", "material", "rubric", "guide", "tp", "dua"] as const;
const forbidden = /(?:simce|paes|ensayo\\s*(?:de\\s*)?(?:simce|paes)|competencia lectora paes)/i;
function safeText(value: unknown, max = 200) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function excluded(value: unknown): boolean { return forbidden.test(JSON.stringify(value ?? "")); }
async function licensedUser() {
  const session = await getSession();
  if (!session?.id) return null;
  const u = await prisma.user.findUnique({ where: { id: String(session.id) }, select: { id: true, active: true, accountType: true, subscriptionStatus: true, subscriptionEndsAt: true, trialEndsAt: true, role: true } });
  if (!u?.active) return null;
  if (u.role === "SUPERADMIN") return u;
  if (u.accountType === "INDIVIDUAL") {
    const until = u.subscriptionStatus === "TRIAL" ? u.trialEndsAt : u.subscriptionStatus === "ACTIVE" ? u.subscriptionEndsAt : null;
    if (!until || until <= new Date()) return null;
  }
  return u;
}
const headers = { "Cache-Control": "private, no-store" };
export async function GET(request: Request) {
  const u = await licensedUser();
  if (!u) return NextResponse.json({ error: "Se requiere una licencia vigente" }, { status: 403, headers });
  const url = new URL(request.url);
  const mine = url.searchParams.get("mine") === "1";
  const kind = safeText(url.searchParams.get("kind"), 40);
  const q = safeText(url.searchParams.get("q"), 100);
  const where: any = mine ? { authorId: u.id } : { published: true };
  if (kinds.includes(kind as any)) where.kind = kind;
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { subject: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];
  const rows = await prisma.sharedLibraryResource.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ resources: rows.filter(x => !excluded([x.title,x.description,x.content])) }, { headers });
}
export async function POST(request: Request) {
  const u = await licensedUser();
  if (!u) return NextResponse.json({ error: "Se requiere una licencia vigente" }, { status: 403, headers });
  let b: any;
  try { b = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const kind = safeText(b.kind, 40), title = safeText(b.title);
  const content = b.content;
  if (!kinds.includes(kind as any) || !title || !content || typeof content !== "object" || Array.isArray(content) || JSON.stringify(content).length > 150000) return NextResponse.json({ error: "Recurso inválido" }, { status: 400 });
  const description = safeText(b.description, 600), subject = safeText(b.subject, 120), level = safeText(b.level, 80), objective = safeText(b.objective, 150);
  if (excluded([kind,title,description,subject,level,objective,content])) return NextResponse.json({ error: "Los ensayos SIMCE y PAES no pueden compartirse" }, { status: 400 });
  const published = b.published === true;
  const created = await prisma.sharedLibraryResource.create({ data: { authorId: u.id, title, kind, description, subject, level, objective, content, published } });
  return NextResponse.json({ resource: created }, { status: 201, headers });
}
export async function PATCH(request: Request) {
  const u = await licensedUser();
  if (!u) return NextResponse.json({ error: "Se requiere una licencia vigente" }, { status: 403, headers });
  let b: any;
  try { b = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const id = safeText(b.id, 100);
  const current = await prisma.sharedLibraryResource.findFirst({ where: { id, authorId: u.id } });
  if (!current) return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });
  if (excluded([current.title,current.description,current.content])) return NextResponse.json({ error: "Recurso excluido" }, { status: 400 });
  await prisma.sharedLibraryResource.update({ where: { id }, data: { published: b.published === true } });
  return NextResponse.json({ ok: true }, { headers });
}
