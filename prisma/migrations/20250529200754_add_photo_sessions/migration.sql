-- CreateTable
CREATE TABLE "PhotoSession" (
    "sessionId" TEXT NOT NULL,
    "photoFileNames" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoSession_pkey" PRIMARY KEY ("sessionId")
);
