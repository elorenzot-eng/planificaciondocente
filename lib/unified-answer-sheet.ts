import { SIMCE_PAPER_MM, simcePaperCalibration } from "./simce-paper-template";

export type ExamFamily = "SIMCE" | "PAES";
export type ExamSubject = "Lectura" | "Matemáticas" | "Competencia Lectora" | "Matemática M1" | "Matemática M2" | "Ciencias" | "Historia y Ciencias Sociales";

export type UnifiedAnswerSheet = {
  family: ExamFamily;
  subject: ExamSubject;
  title: string;
  totalQuestions: number;
  courseLabel: "Curso";
  rutLabel: "RUT";
  rutPattern: "OO.OOO.OOO-O";
  alternatives: readonly ["A", "B", "C", "D"];
  paper: typeof SIMCE_PAPER_MM;
  calibration: ReturnType<typeof simcePaperCalibration>;
  leftRows: number;\n  pages: readonly {startQuestion:number;questionCount:number;leftRows:number}[];
};

const allowed: Record<ExamFamily, readonly ExamSubject[]> = {
  SIMCE: ["Lectura", "Matemáticas"],
  PAES: ["Competencia Lectora", "Matemática M1", "Matemática M2", "Ciencias", "Historia y Ciencias Sociales"],
};

/** Shared contract for generating and scanning a response sheet.
 * The PDF renderer and OMR reader must consume the same calibrated geometry.
 * This module does not itself generate a PDF or recognize a scanned RUT.
 */
export function createUnifiedAnswerSheet(
  family: ExamFamily,
  subject: ExamSubject,
  totalQuestions: number,
): UnifiedAnswerSheet {
  if (!allowed[family]?.includes(subject)) throw new Error("Evaluación o asignatura inválida");
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1 || totalQuestions > 80)
    throw new Error("Cantidad de preguntas inválida");
  const pages = Array.from({length:Math.ceil(totalQuestions/50)},(_,i)=>{\n    const questionCount=Math.min(50,totalQuestions-i*50);\n    return {startQuestion:i*50+1,questionCount,leftRows:Math.ceil(questionCount/2)};\n  });\n  const leftRows = pages[0].leftRows;
  const calibration = simcePaperCalibration();
  return {
    family, subject,
    title: `Ensayo ${family} de ${subject}`,
    totalQuestions,
    courseLabel: "Curso",
    rutLabel: "RUT",
    rutPattern: "OO.OOO.OOO-O",
    alternatives: ["A", "B", "C", "D"],
    paper: SIMCE_PAPER_MM,
    calibration,
    leftRows,
  };
}
