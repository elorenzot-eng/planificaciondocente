-- EducAntay: additive schema change for Recursos de Aprendizaje IA.
-- Review against a staging clone before applying in production.
-- Requires existing public."User" table; does not modify existing user records.
BEGIN;
CREATE TABLE IF NOT EXISTS public."LearningResource" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  "grade" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LearningResource_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LearningResource_userId_updatedAt_idx"
  ON public."LearningResource"("userId", "updatedAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LearningResource_userId_fkey') THEN
    ALTER TABLE public."LearningResource" ADD CONSTRAINT "LearningResource_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
COMMIT;
