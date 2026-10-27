/** Utilidades de importación institucional. No persiste datos ni concede licencias. */
export type StudentImportRow = {
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  rut: string;
  course: string;
};
export type ImportIssue = { row: number; reason: string };
export const STUDENT_IMPORT_HEADERS = ["Nombres", "Apellido paterno", "Apellido materno", "RUT", "Curso"] as const;

export function normalizeChileanRut(value: unknown): string {
  const raw = String(value ?? "").toUpperCase().replace(/[^0-9K]/g, "");
  if (raw.length < 2) return "";
  return raw.slice(0, -1) + "-" + raw.slice(-1);
}
export function isValidChileanRut(value: unknown): boolean {
  const rut = normalizeChileanRut(value);
  const [digits, dv] = rut.split("-");
  if (!digits || !/^[0-9]{1,8}$/.test(digits) || !/^[0-9K]$/.test(dv)) return false;
  let sum = 0;
  let factor = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += Number(digits[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
  return dv === expected;
}
export function validateStudentImport(rows: unknown[][]): { students: StudentImportRow[]; issues: ImportIssue[] } {
  const students: StudentImportRow[] = [];
  const issues: ImportIssue[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < rows.length; i++) {
    const cells = Array.isArray(rows[i]) ? rows[i] : [];
    const [firstName, paternalSurname, maternalSurname, rutInput, course] =
      Array.from({length: 5}, (_, j) => String(cells[j] ?? "").trim());
    if (![firstName, paternalSurname, maternalSurname, rutInput, course].some(Boolean)) continue;
    const rut = normalizeChileanRut(rutInput);
    const reasons: string[] = [];
    if (![firstName, paternalSurname, maternalSurname, course].every(Boolean)) reasons.push("Faltan nombres, apellidos o curso");
    if (!isValidChileanRut(rut)) reasons.push("RUT inválido");
    if (seen.has(rut)) reasons.push("RUT duplicado en la planilla");
    if (reasons.length) {
      issues.push({row: i + 2, reason: reasons.join("; ")});
      continue;
    }
    seen.add(rut);
    students.push({firstName, paternalSurname, maternalSurname, rut, course});
  }
  return {students, issues};
}
