-- CreateEnum
CREATE TYPE "MemoriaType" AS ENUM ('GRAVIDEZ', 'NASCIMENTO', 'MARCO', 'ANIVERSÁRIO', 'FOTO', 'CARTA', 'OUTRO');

-- CreateTable
CREATE TABLE "Memoria" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "happenedAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "type" "MemoriaType" NOT NULL DEFAULT 'OUTRO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memoria_pkey" PRIMARY KEY ("id")
);
