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
      throw new Error('Employee not found');
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
      const updated = await tx.employee.update({
        where: { id },
        data: dto,
      });

      // update/create current period
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
          },
        });
      }

      return updated;
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
      throw new Error('Employee not found');
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
      // find or create salary period
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
            salary: employee.salary, // snapshot
          },
        });
      }

      // payment linked to period
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

      // update last paid date
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