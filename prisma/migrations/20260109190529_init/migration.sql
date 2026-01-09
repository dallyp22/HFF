-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'DECLINED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "GrantCycle" AS ENUM ('SPRING', 'FALL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('FORM_990', 'FORM_990_EZ', 'FORM_990_N', 'FINANCIAL_STATEMENT', 'AUDIT_REPORT', 'PROJECT_NARRATIVE', 'PROJECT_BUDGET', 'BOARD_LIST', 'IRS_DETERMINATION', 'ANNUAL_REPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentScope" AS ENUM ('ORGANIZATION', 'APPLICATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "title" TEXT,
    "organizationId" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "dbaName" TEXT,
    "ein" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "yearFounded" INTEGER,
    "missionStatement" TEXT NOT NULL,
    "is501c3" BOOLEAN NOT NULL DEFAULT true,
    "taxExemptSince" TIMESTAMP(3),
    "irsSubsection" TEXT,
    "executiveDirectorName" TEXT,
    "executiveDirectorEmail" TEXT,
    "executiveDirectorPhone" TEXT,
    "fullTimeStaff" INTEGER,
    "partTimeStaff" INTEGER,
    "volunteers" INTEGER,
    "boardMembers" INTEGER,
    "annualBudget" DECIMAL(12,2),
    "fiscalYearEnd" TEXT,
    "form990Year" INTEGER,
    "form990TotalRevenue" DECIMAL(12,2),
    "form990TotalExpenses" DECIMAL(12,2),
    "form990NetAssets" DECIMAL(12,2),
    "form990ProgramExpenses" DECIMAL(12,2),
    "form990AdminExpenses" DECIMAL(12,2),
    "form990FundraisingExpenses" DECIMAL(12,2),
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "profileCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "applicationId" TEXT,
    "scope" "DocumentScope" NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "documentYear" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "uploadedById" TEXT NOT NULL,
    "uploadedByName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "grantCycle" "GrantCycle" NOT NULL,
    "cycleYear" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "submittedById" TEXT,
    "submittedByName" TEXT,
    "projectTitle" TEXT,
    "projectDescription" TEXT,
    "projectGoals" TEXT,
    "targetPopulation" TEXT,
    "geographicArea" TEXT,
    "projectStartDate" TIMESTAMP(3),
    "projectEndDate" TIMESTAMP(3),
    "amountRequested" DECIMAL(10,2),
    "totalProjectBudget" DECIMAL(10,2),
    "percentageRequested" DECIMAL(5,2),
    "otherFundingSources" TEXT,
    "previousHFFGrants" TEXT,
    "expectedOutcomes" TEXT,
    "measurementPlan" TEXT,
    "sustainabilityPlan" TEXT,
    "beneficiariesCount" INTEGER,
    "childrenServed" INTEGER,
    "ageRangeStart" INTEGER,
    "ageRangeEnd" INTEGER,
    "povertyIndicators" TEXT,
    "schoolsServed" TEXT,
    "budgetBreakdown" JSONB,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completedSteps" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "lastSavedAt" TIMESTAMP(3),
    "aiSummary" TEXT,
    "aiSummaryGeneratedAt" TIMESTAMP(3),
    "aiMissionAlignment" INTEGER,
    "aiBudgetAnalysis" JSONB,
    "aiStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiConcerns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "previousStatus" "ApplicationStatus",
    "newStatus" "ApplicationStatus" NOT NULL,
    "changedById" TEXT,
    "changedByName" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Communication" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "sentById" TEXT,
    "sentByName" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseRequired" BOOLEAN NOT NULL DEFAULT false,
    "responseDeadline" TIMESTAMP(3),
    "responseReceivedAt" TIMESTAMP(3),
    "responseContent" TEXT,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantCycleConfig" (
    "id" TEXT NOT NULL,
    "cycle" "GrantCycle" NOT NULL,
    "year" INTEGER NOT NULL,
    "loiOpenDate" TIMESTAMP(3),
    "loiDeadline" TIMESTAMP(3) NOT NULL,
    "fullAppDeadline" TIMESTAMP(3),
    "reviewStartDate" TIMESTAMP(3),
    "decisionDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "acceptingApplications" BOOLEAN NOT NULL DEFAULT false,
    "maxRequestAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrantCycleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userType" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_ein_key" ON "Organization"("ein");

-- CreateIndex
CREATE INDEX "Organization_ein_idx" ON "Organization"("ein");

-- CreateIndex
CREATE INDEX "Organization_legalName_idx" ON "Organization"("legalName");

-- CreateIndex
CREATE INDEX "Document_organizationId_idx" ON "Document"("organizationId");

-- CreateIndex
CREATE INDEX "Document_applicationId_idx" ON "Document"("applicationId");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_grantCycle_cycleYear_idx" ON "Application"("grantCycle", "cycleYear");

-- CreateIndex
CREATE INDEX "Application_organizationId_idx" ON "Application"("organizationId");

-- CreateIndex
CREATE INDEX "Application_submittedAt_idx" ON "Application"("submittedAt");

-- CreateIndex
CREATE INDEX "Note_applicationId_idx" ON "Note"("applicationId");

-- CreateIndex
CREATE INDEX "StatusHistory_applicationId_idx" ON "StatusHistory"("applicationId");

-- CreateIndex
CREATE INDEX "Communication_applicationId_idx" ON "Communication"("applicationId");

-- CreateIndex
CREATE INDEX "Communication_responseRequired_responseReceivedAt_idx" ON "Communication"("responseRequired", "responseReceivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GrantCycleConfig_cycle_year_key" ON "GrantCycleConfig"("cycle", "year");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
