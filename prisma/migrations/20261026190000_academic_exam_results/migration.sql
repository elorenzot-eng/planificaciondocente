CREATE TABLE "AcademicExamResult" (
 "id" TEXT NOT NULL,
 "schoolId" TEXT NOT NULL,
 "studentId" TEXT NOT NULL,
 "product" TEXT NOT NULL,
 "subject" TEXT NOT NULL,
 "grade" TEXT NOT NULL,
 "course" TEXT NOT NULL,
 "examId" TEXT NOT NULL,
 "examTitle" TEXT NOT NULL,
 "takenAt" TIMESTAMP(3) NOT NULL,
 "correctAnswers" INTEGER NOT NULL,
 "totalQuestions" INTEGER NOT NULL,
 "score" DOUBLE PRECISION,
 "skillResults" JSONB,
 "source" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "AcademicExamResult_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AcademicExamResult_schoolId_studentId_product_examId_key" ON "AcademicExamResult"("schoolId","studentId","product","examId");
CREATE INDEX "AcademicExamResult_schoolId_course_subject_takenAt_idx" ON "AcademicExamResult"("schoolId","course","subject","takenAt");
CREATE INDEX "AcademicExamResult_studentId_takenAt_idx" ON "AcademicExamResult"("studentId","takenAt");
ALTER TABLE "AcademicExamResult" ADD CONSTRAINT "AcademicExamResult_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademicExamResult" ADD CONSTRAINT "AcademicExamResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "LicensedStudent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
