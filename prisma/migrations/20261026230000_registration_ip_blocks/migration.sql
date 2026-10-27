CREATE TABLE "RegistrationIpBlock" ("id" TEXT NOT NULL,"ipHash" TEXT NOT NULL,"reason" TEXT NOT NULL,"expiresAt" TIMESTAMP(3),"createdById" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "RegistrationIpBlock_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "RegistrationIpBlock_ipHash_key" ON "RegistrationIpBlock"("ipHash");
CREATE INDEX "RegistrationIpBlock_expiresAt_idx" ON "RegistrationIpBlock"("expiresAt");
