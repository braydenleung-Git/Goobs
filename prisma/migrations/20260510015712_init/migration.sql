-- CreateTable
CREATE TABLE "ProviderConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'uuid',
    "baseUrl" TEXT NOT NULL DEFAULT 'http://homelab/bifrost/v1',
    "encryptedApiKey" TEXT,
    "keyIv" TEXT,
    "keyTag" TEXT,
    "keyVersion" INTEGER,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'uuid',
    "name" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "skillsJson" TEXT NOT NULL DEFAULT '[]',
    "toolsJson" TEXT NOT NULL DEFAULT '[]',
    "defaultModel" TEXT NOT NULL,
    "modelColorHex" TEXT NOT NULL DEFAULT '#4f46e5',
    "prefersImageTasks" BOOLEAN NOT NULL DEFAULT false,
    "isPrebuilt" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WorkstationState" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'uuid',
    "workstationId" TEXT NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ChallengeRun" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'uuid',
    "challengeSlug" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "workstationId" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "runtimeStateLogJson" TEXT NOT NULL DEFAULT '[]',
    "outputText" TEXT NOT NULL DEFAULT '',
    "deterministicPass" BOOLEAN NOT NULL DEFAULT false,
    "rubricPass" BOOLEAN NOT NULL DEFAULT false,
    "finalPass" BOOLEAN NOT NULL DEFAULT false,
    "deterministicScore" REAL NOT NULL DEFAULT 0,
    "rubricScore" REAL NOT NULL DEFAULT 0,
    "totalScore" REAL NOT NULL DEFAULT 0,
    "rationale" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProgressState" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'uuid',
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "unlockedItemsJson" TEXT NOT NULL DEFAULT '[]',
    "unlockedWorkstationsJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChallengeRewardEvent" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'uuid',
    "runId" TEXT NOT NULL,
    "challengeSlug" TEXT NOT NULL,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkstationState_workstationId_key" ON "WorkstationState"("workstationId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeRewardEvent_runId_key" ON "ChallengeRewardEvent"("runId");
