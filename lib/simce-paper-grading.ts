export type SimceAlternative = "A" | "B" | "C" | "D";
export type SimceMark = SimceAlternative | null | "MULTIPLE" | "UNCERTAIN";
export type SimceQuestion = { number: number; correct: SimceAlternative; axis?: string; skill?: string };
export type SimceAnswer = { number: number; mark: SimceMark };
export type SimceGrade = {
  correct: number;
  incorrect: number;
  blank: number;
  reviewRequired: number;
  total: number;
  percentage: number | null;
  detail: { number: number; mark: SimceMark; correct: SimceAlternative; status: "correct" | "incorrect" | "blank" | "review"; axis?: string; skill?: string }[];
};
const VALID = new Set(["A", "B", "C", "D"]);
/** Deterministic scoring after teacher confirmation; never guess uncertain marks. */
export function gradeSimce(questions: SimceQuestion[], answers: SimceAnswer[]): SimceGrade {
  if (!questions.length) throw new Error("La pauta no contiene preguntas");
  const qNumbers = questions.map(q => q.number);
  if (new Set(qNumbers).size !== questions.length || questions.some(q => !Number.isInteger(q.number) || q.number < 1 || !VALID.has(q.correct))) {
    throw new Error("Pauta inválida");
  }
  if (new Set(answers.map(a => a.number)).size !== answers.length || answers.some(a => !qNumbers.includes(a.number))) {
    throw new Error("Respuestas duplicadas o ajenas al ensayo");
  }
  const marks = new Map(answers.map(a => [a.number, a.mark]));
  const detail = questions.map(q => {
    const mark = marks.get(q.number) ?? null;
    if (mark !== null && mark !== "MULTIPLE" && mark !== "UNCERTAIN" && !VALID.has(mark)) throw new Error("Marca inválida");
    const status = mark === "MULTIPLE" || mark === "UNCERTAIN" ? "review" as const
      : mark === null ? "blank" as const : mark === q.correct ? "correct" as const : "incorrect" as const;
    return {number:q.number, mark, correct:q.correct, status, axis:q.axis, skill:q.skill};
  });
  const correct = detail.filter(d => d.status === "correct").length;
  const incorrect = detail.filter(d => d.status === "incorrect").length;
  const blank = detail.filter(d => d.status === "blank").length;
  const reviewRequired = detail.filter(d => d.status === "review").length;
  return { correct, incorrect, blank, reviewRequired, total:questions.length,
    percentage:reviewRequired ? null : Math.round(correct / questions.length * 10000) / 100, detail };
}
