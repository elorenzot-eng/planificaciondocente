CREATE TABLE IF NOT EXISTS "EcepExam" (
 "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "title" TEXT NOT NULL,
 "level" TEXT NOT NULL, "specialtyKey" TEXT NOT NULL, "quantity" INTEGER NOT NULL,
 "difficulty" TEXT NOT NULL, "domain" INTEGER NOT NULL DEFAULT -1,
 "status" TEXT NOT NULL DEFAULT 'PENDING', "nextIndex" INTEGER NOT NULL DEFAULT 0,
 "questions" JSONB NOT NULL DEFAULT '[]', "planSnapshot" JSONB NOT NULL DEFAULT '[]', "leaseToken" TEXT, "aiChargedAt" TIMESTAMP(3),
 "error" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "EcepExam_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "EcepExam_userId_status_createdAt_idx" ON "EcepExam"("userId","status","createdAt");
