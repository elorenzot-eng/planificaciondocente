/** Publicación voluntaria: no compartir evaluaciones reservadas ni datos identificables. */
const blockedTopics = /simce|paes|ensayo nacional/i;
const blockedFields = /^(rut|run|dni|studentId|studentName|studentEmail|studentRut|studentRun|studentList|students|estudiantes|alumnos|apellidoPaterno|apellidoMaterno|nombreCompleto|diagnostico|diagnosis|fudei|paci|paec|email|correo|telefono|phone|address|direccion|fechaNacimiento|birthDate)$/i;
const identityPatterns = [
  /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i,
  /\b\d{1,2}\.\d{3}\.\d{3}-[0-9kK]\b/,
  /\b\d{7,8}-[0-9kK]\b/
];
export function canShareEducationalResource(input: unknown): boolean {
  const raw = JSON.stringify(input ?? "");
  if (raw.length > 150000 || blockedTopics.test(raw) || identityPatterns.some(pattern => pattern.test(raw))) return false;
  const seen = new WeakSet<object>();
  function inspect(value: unknown, depth: number): boolean {
    if (depth > 30) return false;
    if (typeof value === "string") return !blockedTopics.test(value) && !identityPatterns.some(pattern => pattern.test(value));
    if (value === null || typeof value !== "object") return true;
    if (seen.has(value)) return false;
    seen.add(value);
    if (Array.isArray(value)) return value.every(item => inspect(item, depth + 1));
    return Object.entries(value).every(([key, item]) => !blockedFields.test(key) && inspect(item, depth + 1));
  }
  return inspect(input, 0);
}
