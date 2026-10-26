import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { normalizeRut, validateStudentRows, type StudentRow } from "./institutional-student-import";

type ImportArgs = {
  schoolId: string;
  rows: StudentRow[];
  allowedCourses: ReadonlySet<string>;
  licensedStudentCount: number;
};

export async function previewInstitutionalStudentImport(args: Omit<ImportArgs, "licensedStudentCount">) {
  const existing = await prisma.institutionalStudent.findMany({
    where: { schoolId: args.schoolId },
    select: { rut: true },
  });
  return validateStudentRows(args.rows, args.allowedCourses, new Set(existing.map(s => normalizeRut(s.rut))));
}

/** El controlador debe autenticar y autorizar el establecimiento antes de llamar este servicio. */
export async function commitInstitutionalStudentImport(args: ImportArgs) {
  if (!Number.isSafeInteger(args.licensedStudentCount) || args.licensedStudentCount < 1) {
    throw new Error("Matrícula contratada inválida");
  }
  return prisma.$transaction(async tx => {
    const existing = await tx.institutionalStudent.findMany({
      where: { schoolId: args.schoolId }, select: { rut: true },
    });
    const result = validateStudentRows(args.rows, args.allowedCourses, new Set(existing.map(s => normalizeRut(s.rut))));
    if (result.errors.length) return { imported: 0, errors: result.errors };
    const activeCount = await tx.institutionalStudent.count({
      where: { schoolId: args.schoolId, active: true },
    });
    if (activeCount + result.students.length > args.licensedStudentCount) {
      return { imported: 0, errors: [{ fila: 0, campo: "Matrícula", mensaje: "La carga supera la matrícula contratada" }] };
    }
    const created = await tx.institutionalStudent.createMany({
      data: result.students.map(s => ({
        schoolId: args.schoolId, nombres: s.nombres, apellidoPaterno: s.apellidoPaterno,
        apellidoMaterno: s.apellidoMaterno, rut: s.rut, curso: s.curso,
      })),
    });
    return { imported: created.count, errors: [] };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
