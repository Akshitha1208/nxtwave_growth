-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "referralCode" TEXT NOT NULL,
    "recommendedProject" TEXT,
    "buildabilityScore" INTEGER,
    "quizAnswers" TEXT,
    "source" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "referralCodeUsed" TEXT,
    "referredById" TEXT,
    "campusCaptainId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampusCaptain" (
    "id" TEXT NOT NULL,
    "captainName" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CampusCaptain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_referralCode_key" ON "Student"("referralCode");

-- CreateIndex
CREATE INDEX "Student_referredById_idx" ON "Student"("referredById");

-- CreateIndex
CREATE INDEX "Student_campusCaptainId_idx" ON "Student"("campusCaptainId");

-- CreateIndex
CREATE UNIQUE INDEX "CampusCaptain_code_key" ON "CampusCaptain"("code");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_campusCaptainId_fkey" FOREIGN KEY ("campusCaptainId") REFERENCES "CampusCaptain"("id") ON DELETE SET NULL ON UPDATE CASCADE;