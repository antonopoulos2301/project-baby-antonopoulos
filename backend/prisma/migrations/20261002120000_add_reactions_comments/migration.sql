-- CreateTable
CREATE TABLE "MemoryReaction" (
    "id" SERIAL NOT NULL,
    "memoriaId" INTEGER NOT NULL,
    "emoji" VARCHAR(16) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MemoryReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryComment" (
    "id" SERIAL NOT NULL,
    "memoriaId" INTEGER NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoryComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemoryReaction_memoriaId_emoji_key" ON "MemoryReaction"("memoriaId", "emoji");

-- CreateIndex
CREATE INDEX "MemoryComment_memoriaId_createdAt_idx" ON "MemoryComment"("memoriaId", "createdAt");

-- AddForeignKey
ALTER TABLE "MemoryReaction" ADD CONSTRAINT "MemoryReaction_memoriaId_fkey" FOREIGN KEY ("memoriaId") REFERENCES "Memoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryComment" ADD CONSTRAINT "MemoryComment_memoriaId_fkey" FOREIGN KEY ("memoriaId") REFERENCES "Memoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
