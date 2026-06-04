-- DropForeignKey
ALTER TABLE "SalaryPeriod" DROP CONSTRAINT "SalaryPeriod_employeeId_fkey";

-- AddForeignKey
ALTER TABLE "SalaryPeriod" ADD CONSTRAINT "SalaryPeriod_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
