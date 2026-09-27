import { NextResponse } from "next/server";import { getSession,clearSession } from "../../../lib/auth";
export async function GET(){return NextResponse.json({user:await getSession()})}
export async function DELETE(){await clearSession();return NextResponse.json({ok:true})}