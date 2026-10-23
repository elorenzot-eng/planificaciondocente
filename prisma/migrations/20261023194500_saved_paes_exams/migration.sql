CREATE TABLE IF NOT EXISTS "SavedPaesExam" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sourceJobId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "examType" TEXT NOT NULL,
  "exam" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SavedPaesExam_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SavedPaesExam_userId_sourceJobId_key" ON "SavedPaesExam"("userId","sourceJobId");
CREATE INDEX IF NOT EXISTS "SavedPaesExam_userId_createdAt_idx" ON "SavedPaesExam"("userId","createdAt");
