/** Normalización y validación de estudiantes para carga institucional XLSX.
 * Este módulo valida filas ya extraídas; la lectura del XLSX y autorización son responsabilidad del endpoint.
 */
export const STUDENT_COLUMNS = ["Nombres", "Apellido paterno", "Apellido materno", "RUT", "Curso"] as const;
export type StudentRow = Record<(typeof STUDENT_COLUMNS)[number], unknown>;
export type ValidStudent = { nombres: string; apellidoPaterno: string; apellidoMaterno: string; rut: string; curso: string; fila: number };
export type ImportError = { fila: number; campo: string; mensaje: string };

export function normalizeRut(value: unknown): string {
  return String(value ?? "").replace(/[.\s-]/g, "").toUpperCase();
}

export function isValidChileanRut(value: unknown): boolean {
  const rut = normalizeRut(value);
  if (!/^[0-9]{1,8}[0-9K]$/.test(rut)) return false;
  const digits = rut.slice(0, -1);
  if (Number(digits) === 0) return false;
  let sum = 0, factor = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += Number(digits[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const remainder = 11 - (sum % 11);
  const dv = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
  return rut.endsWith(dv);
}

export function validateStudentRows(
  rows: StudentRow[],
  allowedCourses: ReadonlySet<string>,
  existingRuts: ReadonlySet<string> = new Set(),
  maxRows = 10000,
): { students: ValidStudent[]; errors: ImportError[] } {
  const students: ValidStudent[] = [], errors: ImportError[] = [];
  if (rows.length > maxRows) return { students, errors: [{ fila: 0, campo: "Archivo", mensaje: "Excede el máximo de filas" }] };
  const seen = new Set<string>();
  for (const [index, row] of rows.entries()) {
    const fila = index + 2;
    const values = STUDENT_COLUMNS.map(col => String(row[col] ?? "").trim());
    if (values.every(v => !v)) continue;
    STUDENT_COLUMNS.forEach((col, i) => {
      if (!values[i]) errors.push({ fila, campo: col, mensaje: "Campo obligatorio" });
      else if (values[i].length > 150) errors.push({ fila, campo: col, mensaje: "Texto demasiado largo" });
    });
    const rut = normalizeRut(row.RUT);
    if (rut && !isValidChileanRut(rut)) errors.push({ fila, campo: "RUT", mensaje: "RUT inválido" });
    if (rut && seen.has(rut)) errors.push({ fila, campo: "RUT", mensaje: "RUT duplicado en planilla" });
    if (rut && existingRuts.has(rut)) errors.push({ fila, campo: "RUT", mensaje: "Estudiante ya registrado" });
    if (rut) seen.add(rut);
    const curso = values[4];
    if (curso && !allowedCourses.has(curso)) errors.push({ fila, campo: "Curso", mensaje: "Curso no registrado en el establecimiento" });
    students.push({ nombres: values[0], apellidoPaterno: values[1], apellidoMaterno: values[2], rut, curso, fila });
  }
  return { students: errors.length ? [] : students, errors };
}
