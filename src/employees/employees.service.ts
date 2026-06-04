import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { User } from '@prisma/client';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AddEmployeePaymentDto } from './dto/add-employee-payment.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        ...dto,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(user: User) {
    return this.prisma.employee.findMany({
      where: {
        user: { id: user.id },
      },
      include: {
        payments: {
          orderBy: { date: 'desc' },
        },
        salaryPeriods: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: id,
        userId: userId,
      },
      include: {
        payments: {
          orderBy: { date: 'desc' },
        },
        salaryPeriods: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }


  async update(id: string, userId: string, dto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, userId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update employee fields (including base salary)
      const updated = await tx.employee.update({
        where: { id },
        data: dto,
      });

      // Update/create current period with new salary
      if (dto.salary !== undefined) {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        await tx.salaryPeriod.upsert({
          where: {
            employeeId_month_year: {
              employeeId: id,
              month,
              year,
            },
          },
          update: {
            salary: dto.salary,
          },
          create: {
            employeeId: id,
            month,
            year,
            salary: dto.salary,
            balance: 0, // New periods start with no balance
          },
        });
      }

      // Return employee with updated salary periods to reflect changes
      return tx.employee.findFirst({
        where: { id, userId },
        include: {
          payments: {
            orderBy: { date: 'desc' },
          },
          salaryPeriods: true,
        },
      });
    });
  }

  async delete(id: string, userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.employee.delete({
      where: {
        id,
      },
    });
  }

  async addPayment(id: string, userId: string, dto: AddEmployeePaymentDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, userId },
      include:{
        payments: true,
        salaryPeriods: true,
      }
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const date = dto.date ? new Date(dto.date) : new Date();
    const month = date.getMonth();
    const year = date.getFullYear();

    return this.prisma.$transaction(async (tx) => {
      // Get balance from previous month
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;

      const previousPeriod = await tx.salaryPeriod.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: id,
            month: prevMonth,
            year: prevYear,
          },
        },
      });

      const carryoverBalance = previousPeriod?.balance ?? 0;

      // Find or create salary period for this payment
      let period = await tx.salaryPeriod.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: id,
            month,
            year,
          },
        },
      });

      if (!period) {
        period = await tx.salaryPeriod.create({
          data: {
            employeeId: id,
            month,
            year,
            salary: employee.salary,
            balance: carryoverBalance, // Carry over balance from previous month
          },
        });
      }

      // Create payment
      const payment = await tx.employeePayment.create({
        data: {
          amount: dto.amount,
          description: dto.description || 'Salary',
          date,
          employee: { connect: { id } },
          user: { connect: { id: userId } },
          salaryPeriod: { connect: { id: period.id } },
        },
      });

      // Calculate new balance: what carries over to next month
      // balance = paid - (salary + carryover)
      // Positive balance = credit/overpaid, Negative = debt/underpaid
      const paidThisMonth = await tx.employeePayment.aggregate({
        where: {
          salaryPeriodId: period.id,
        },
        _sum: {
          amount: true,
        },
      });

      const totalPaidThisMonth = paidThisMonth._sum.amount ?? 0;
      const totalOwedThisMonth = (period.salary - carryoverBalance);
      const newBalance = totalPaidThisMonth - totalOwedThisMonth;

      // Update period with new balance
      await tx.salaryPeriod.update({
        where: { id: period.id },
        data: { balance: newBalance },
      });

      // Update last paid date
      await tx.employee.update({
        where: { id },
        data: {
          lastPaidDate: date,
        },
      });

      return payment;
    });
  }
}