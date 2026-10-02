-- CreateEnum
CREATE TYPE "GuestbookStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "GuestbookMessage" ADD COLUMN "status" "GuestbookStatus" NOT NULL DEFAULT 'PENDING';

-- Mantém visíveis as mensagens que já existiam antes da moderação
UPDATE "GuestbookMessage" SET "status" = 'APPROVED';

-- CreateIndex
CREATE INDEX "GuestbookMessage_status_createdAt_idx" ON "GuestbookMessage"("status", "createdAt");

-- DropIndex (índice antigo só por createdAt, substituído pelo composto)
DROP INDEX IF EXISTS "GuestbookMessage_createdAt_idx";
