-- CreateTable
CREATE TABLE "TestimonialPreset" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "source" TEXT NOT NULL DEFAULT 'reviews',
    "limit" INTEGER,
    "manual" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestimonialPreset_pkey" PRIMARY KEY ("id")
);
