-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(120),
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoReaction" (
    "id" SERIAL NOT NULL,
    "photoId" INTEGER NOT NULL,
    "emoji" VARCHAR(16) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PhotoReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoComment" (
    "id" SERIAL NOT NULL,
    "photoId" INTEGER NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Photo_createdAt_idx" ON "Photo"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoReaction_photoId_emoji_key" ON "PhotoReaction"("photoId", "emoji");

-- CreateIndex
CREATE INDEX "PhotoComment_photoId_createdAt_idx" ON "PhotoComment"("photoId", "createdAt");

-- AddForeignKey
ALTER TABLE "PhotoReaction" ADD CONSTRAINT "PhotoReaction_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoComment" ADD CONSTRAINT "PhotoComment_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
