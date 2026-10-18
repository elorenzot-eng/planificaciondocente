import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { preparePortfolioFormativeFeedback } from "../../../lib/portfolio-2026-formative-feedback";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud JSON inválida" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const { evidenceText } = payload as Record<string, unknown>;
  if (typeof evidenceText !== "string") {
    return NextResponse.json({ error: "La evidencia debe ser texto" }, { status: 400 });
  }

  try {
    const feedback = preparePortfolioFormativeFeedback({ evidenceText });
    return NextResponse.json({
      year: 2026,
      status: "EVIDENCE_REGISTERED_PENDING_PEDAGOGICAL_REVIEW",
      feedback,
      officialScore: null,
      aiAnalysisPerformed: false,
      note: "Registro formativo de evidencia. No equivale a evaluación oficial ni revisión automática.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Evidencia inválida",
    }, { status: 400 });
  }
}
