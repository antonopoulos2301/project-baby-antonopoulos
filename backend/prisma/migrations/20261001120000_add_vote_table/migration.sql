-- CreateEnum
CREATE TYPE "VoteTeam" AS ENUM ('FILIPE', 'MELINA');

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "team" "VoteTeam" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vote_createdAt_idx" ON "Vote"("createdAt");
