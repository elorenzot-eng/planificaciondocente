import { NextResponse } from "next/server";
import { getSession, clearSession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  const user = await prisma.user.findUnique({
    where: { id: String(session.id) },
    select: { id: true, name: true, email: true, role: true, accountType: true, organizationId: true, schoolId: true, active: true }
  });
  if (!user?.active) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  const { active, ...safeUser } = user;
  return NextResponse.json({ user: safeUser }, { headers: { "Cache-Control": "no-store" } });
}
export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
