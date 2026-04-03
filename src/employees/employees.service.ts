import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { User } from '@prisma/client';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

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
    });

    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }

  async update(id: string, userId: string, dto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!employee) {
      throw new Error('Employee not found');
    }

    return this.prisma.employee.update({
      where: {
        id,
      },
      data: dto,
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
}