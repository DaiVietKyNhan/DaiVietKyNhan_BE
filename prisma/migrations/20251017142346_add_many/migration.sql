-- CreateTable
CREATE TABLE "_KyNhanToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_KyNhanToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_KyNhanSummaryToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_KyNhanSummaryToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_KyNhanToUser_B_index" ON "_KyNhanToUser"("B");

-- CreateIndex
CREATE INDEX "_KyNhanSummaryToUser_B_index" ON "_KyNhanSummaryToUser"("B");

-- AddForeignKey
ALTER TABLE "_KyNhanToUser" ADD CONSTRAINT "_KyNhanToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "KyNhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KyNhanToUser" ADD CONSTRAINT "_KyNhanToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KyNhanSummaryToUser" ADD CONSTRAINT "_KyNhanSummaryToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "KyNhanSummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KyNhanSummaryToUser" ADD CONSTRAINT "_KyNhanSummaryToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
