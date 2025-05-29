-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "captureMode" TEXT NOT NULL,
    "photoCount" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "allowUserChoice" BOOLEAN NOT NULL,
    "deliveryMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
