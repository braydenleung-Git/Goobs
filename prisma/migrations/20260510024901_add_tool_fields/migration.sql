-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChallengeRun" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'uuid',
    "challengeSlug" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "workstationId" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "runtimeStateLogJson" TEXT NOT NULL DEFAULT '[]',
    "outputText" TEXT NOT NULL DEFAULT '',
    "toolCallsJson" TEXT NOT NULL DEFAULT '[]',
    "artifactsJson" TEXT NOT NULL DEFAULT '[]',
    "deterministicPass" BOOLEAN NOT NULL DEFAULT false,
    "rubricPass" BOOLEAN NOT NULL DEFAULT false,
    "finalPass" BOOLEAN NOT NULL DEFAULT false,
    "deterministicScore" REAL NOT NULL DEFAULT 0,
    "rubricScore" REAL NOT NULL DEFAULT 0,
    "totalScore" REAL NOT NULL DEFAULT 0,
    "rationale" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ChallengeRun" ("agentId", "challengeSlug", "createdAt", "deterministicPass", "deterministicScore", "finalPass", "id", "modelUsed", "outputText", "rationale", "rubricPass", "rubricScore", "runtimeStateLogJson", "totalScore", "workstationId") SELECT "agentId", "challengeSlug", "createdAt", "deterministicPass", "deterministicScore", "finalPass", "id", "modelUsed", "outputText", "rationale", "rubricPass", "rubricScore", "runtimeStateLogJson", "totalScore", "workstationId" FROM "ChallengeRun";
DROP TABLE "ChallengeRun";
ALTER TABLE "new_ChallengeRun" RENAME TO "ChallengeRun";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
