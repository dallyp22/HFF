-- CreateTable
CREATE TABLE "FoundationSettings" (
    "id" TEXT NOT NULL,
    "foundationName" TEXT NOT NULL,
    "tagline" TEXT,
    "missionStatement" TEXT NOT NULL,
    "visionStatement" TEXT,
    "focusAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primaryEmail" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "streetAddress" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "linkedinUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    "updatedByName" TEXT,

    CONSTRAINT "FoundationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FoundationSettings_id_idx" ON "FoundationSettings"("id");
