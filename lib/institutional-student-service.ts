import { prisma } from './prisma';

export async function countInstitutionalStudents(schoolId: string) {
  return prisma.institutionalStudent.count({ where: { schoolId, active: true } });
}
