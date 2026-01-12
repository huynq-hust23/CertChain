-- CreateTable
CREATE TABLE "Certificate" (
    "id" SERIAL NOT NULL,
    "certPublicKey" TEXT NOT NULL,
    "ownerPublicKey" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certPublicKey_ownerPublicKey_key" ON "Certificate"("certPublicKey", "ownerPublicKey");
