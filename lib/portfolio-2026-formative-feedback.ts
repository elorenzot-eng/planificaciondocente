export type PortfolioEvidenceFeedback = {
  evidencePresented: string[];
  observedStrengths: string[];
  improvementAreas: string[];
  pedagogicalSuggestions: string[];
  rubricIndicatorIds: string[];
  limitations: string[];
};

export type PortfolioFeedbackInput = {
  evidenceText: string;
  rubricIndicatorIds?: string[];
};

const MAX_EVIDENCE_CHARS = 30000;

/**
 * Prepares evidence for formative review without assigning an official score.
 * No strengths or deficiencies are inferred without a validated rubric review.
 */
export function preparePortfolioFormativeFeedback(input: PortfolioFeedbackInput): PortfolioEvidenceFeedback {
  const evidence = input.evidenceText?.trim() ?? "";
  if (!evidence || evidence.length > MAX_EVIDENCE_CHARS) {
    throw new Error("La evidencia debe contener entre 1 y 30000 caracteres.");
  }
  return {
    evidencePresented: [evidence],
    observedStrengths: [],
    improvementAreas: [],
    pedagogicalSuggestions: [],
    rubricIndicatorIds: [],
    limitations: [
      "La evidencia se ha registrado, pero aún no ha sido contrastada con descriptores oficiales validados.",
      "No se asignan niveles de desempeño, porcentajes ni calificaciones oficiales.",
      "Las fortalezas, oportunidades de mejora y sugerencias requieren análisis pedagógico contextualizado.",
    ],
  };
}
