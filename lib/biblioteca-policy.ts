/** Publicación voluntaria: bloquear evaluaciones reservadas y datos identificables. */
export function canShareEducationalResource(input: unknown): boolean {
  const raw = JSON.stringify(input ?? "");
  if (raw.length > 150000) return false;
  if (/simce|paes|ensayo nacional/i.test(raw)) return false;
  if (/"(?:rut|run|studentId|studentName|studentEmail|apellidoPaterno|apellidoMaterno|diagnostico|fudei|paci|paec)"\s*:/i.test(raw)) return false;
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(raw)) return false;
  return true;
}
