import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartonDto } from './dto/create-carton.dto';
import { User, SaleStatus } from '@prisma/client';
import { UpdateCartonDto } from './dto/update-carton.dto';

@Injectable()
export class CartonsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateCartonDto) {
    
    const amountPaid = dto.amountPaid ?? 0;
    const totalAmount = dto.totalAmount;
    const remainingAmount = dto.remainingAmount;
    const date = new Date(dto.date);

    let status: SaleStatus;

    if (amountPaid === totalAmount) {
      status = 'PAID';
    } else if (amountPaid === 0) {
      status = 'UNPAID';
    } else {
      status = 'PARTIAL';
    }

    return this.prisma.carton.create({
      data: {
        ...dto,
        date,
        status,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(user: User) {
    return this.prisma.carton.findMany({
      where: {
        user: { id: user.id },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {

    const carton = await this.prisma.carton.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!carton) {
      throw new NotFoundException('Carton not found');
    }
    return carton;
  }

  async update(id: string, userId: string, dto: UpdateCartonDto) {
    
    const carton = await this.prisma.carton.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!carton) {
      throw new NotFoundException('Carton not found');
    }
    const date = new Date(dto.date);
    // Calculate new status if payment amounts are being updated
    let status = carton.status;
    if (dto.amountPaid !== undefined || dto.totalAmount !== undefined) {
      const newAmountPaid = dto.amountPaid ?? carton.amountPaid;
      const newTotalAmount = dto.totalAmount ?? carton.totalAmount;

      if (newAmountPaid === newTotalAmount) {
        status = 'PAID';
      } else if (newAmountPaid === 0) {
        status = 'UNPAID';
      } else {
        status = 'PARTIAL';
      }
    }

    return this.prisma.carton.update({
      where: {
        id,
      },
      data: {
        ...dto,
        date,
        status,
      },
    });
  }

  async delete(id: string, userId: string) {
    const carton = await this.prisma.carton.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!carton) {
      throw new Error('Carton not found');
    }

    return this.prisma.carton.delete({
      where: {
        id,
      },
    });
  }

  async addPayment(id: string, userId: string, dto: { amount: number }) {
    const carton = await this.prisma.carton.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!carton) {
      throw new Error('Carton not found');
    }

    const newAmountPaid = carton.amountPaid + dto.amount;
    if (newAmountPaid > carton.totalAmount) {
      throw new Error('Amount paid cannot be greater than total amount');
    }

    const remainingAmount = carton.totalAmount - newAmountPaid;

    let status: SaleStatus;
    if (newAmountPaid >= carton.totalAmount) status = 'PAID';
    else if (newAmountPaid === 0) status = 'UNPAID';
    else status = 'PARTIAL';

    return this.prisma.carton.update({
      where: { id },
      data: {
        amountPaid: newAmountPaid,
        remainingAmount,
        status,
      },
    });
  }
}