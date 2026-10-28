CREATE TABLE "SharedLibraryResource" (
  "id" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "sourceId" TEXT,
  "title" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "subject" TEXT,
  "level" TEXT,
  "objective" TEXT,
  "description" TEXT,
  "content" JSONB NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SharedLibraryResource_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SharedLibraryResource_published_kind_createdAt_idx" ON "SharedLibraryResource"("published","kind","createdAt");
CREATE INDEX "SharedLibraryResource_authorId_createdAt_idx" ON "SharedLibraryResource"("authorId","createdAt");
CREATE UNIQUE INDEX "SharedLibraryResource_authorId_kind_sourceId_key" ON "SharedLibraryResource"("authorId","kind","sourceId");

CREATE TABLE "PedagogicalModuleLicense" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PedagogicalModuleLicense_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PedagogicalModuleLicense_schoolId_module_active_expiresAt_idx" ON "PedagogicalModuleLicense"("schoolId","module","active","expiresAt");
