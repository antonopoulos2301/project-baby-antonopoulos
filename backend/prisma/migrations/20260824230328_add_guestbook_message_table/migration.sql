-- CreateTable
CREATE TABLE "GuestbookMessage" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestbookMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestbookMessage_createdAt_idx" ON "GuestbookMessage"("createdAt");
