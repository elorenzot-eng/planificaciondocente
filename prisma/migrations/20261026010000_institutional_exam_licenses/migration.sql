CREATE TABLE "InstitutionalExamLicense" (
 "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "schoolId" TEXT NOT NULL,
 "module" TEXT NOT NULL, "studentCount" INTEGER NOT NULL, "pricePerStudentClp" INTEGER NOT NULL DEFAULT 6100,
 "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3) NOT NULL,
 "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "InstitutionalExamLicense_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "InstitutionalExamLicense_organizationId_schoolId_module_active_idx"
 ON "InstitutionalExamLicense"("organizationId","schoolId","module","active","endsAt");
CREATE TABLE "InstitutionalExamQuota" (
 "id" TEXT NOT NULL, "licenseId" TEXT NOT NULL, "grade" TEXT NOT NULL, "subject" TEXT NOT NULL,
 "pdfLimit" INTEGER NOT NULL DEFAULT 10, "pdfUsed" INTEGER NOT NULL DEFAULT 0,
 "reviewLimit" INTEGER NOT NULL, "reviewUsed" INTEGER NOT NULL DEFAULT 0,
 CONSTRAINT "InstitutionalExamQuota_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InstitutionalExamQuota_licenseId_grade_subject_key" ON "InstitutionalExamQuota"("licenseId","grade","subject");
ALTER TABLE "InstitutionalExamQuota" ADD CONSTRAINT "InstitutionalExamQuota_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "InstitutionalExamLicense"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "InstitutionalExamUsage" (
 "id" TEXT NOT NULL, "quotaId" TEXT NOT NULL, "operation" TEXT NOT NULL, "requestKey" TEXT NOT NULL,
 "studentCount" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "InstitutionalExamUsage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InstitutionalExamUsage_requestKey_key" ON "InstitutionalExamUsage"("requestKey");
CREATE INDEX "InstitutionalExamUsage_quotaId_operation_createdAt_idx" ON "InstitutionalExamUsage"("quotaId","operation","createdAt");
