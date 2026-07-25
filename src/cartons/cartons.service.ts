import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartonDto } from './dto/create-carton.dto';
import { User, SaleStatus } from '@prisma/client';
import { UpdateCartonDto } from './dto/update-carton.dto';

@Injectable()
export class CartonsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateCartonDto) {
    const bigQuantity = Number(dto.bigCartonsQuantity ?? 0);
    const smallQuantity = Number(dto.smallCartonsQuantity ?? 0);
    const bigPrice = Number(dto.bigCartonPrice ?? 0);
    const smallPrice = Number(dto.smallCartonPrice ?? 0);
    const calculatedTotal = bigQuantity * bigPrice + smallQuantity * smallPrice;
    const amountPaid = Number(dto.amountPaid ?? 0);
    const totalAmount = Number(dto.totalAmount ?? calculatedTotal);
    const remainingAmount = Number(dto.remainingAmount ?? Math.max(totalAmount - amountPaid, 0));
    const date = new Date(dto.date);

    let status: SaleStatus;

    if (amountPaid >= totalAmount) {
      status = 'PAID';
    } else if (amountPaid === 0) {
      status = 'UNPAID';
    } else {
      status = 'PARTIAL';
    }

    return this.prisma.carton.create({
      data: {
        ...dto,
        quantity: bigQuantity + smallQuantity,
        price: bigPrice + smallPrice,
        bigCartonsQuantity: bigQuantity,
        smallCartonsQuantity: smallQuantity,
        bigCartonPrice: bigPrice,
        smallCartonPrice: smallPrice,
        totalAmount,
        amountPaid,
        remainingAmount,
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
        id,
        userId,
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

    const date = dto.date ? new Date(dto.date) : carton.date;
    const bigQuantity = Number(dto.bigCartonsQuantity ?? carton.bigCartonsQuantity ?? 0);
    const smallQuantity = Number(dto.smallCartonsQuantity ?? carton.smallCartonsQuantity ?? 0);
    const bigPrice = Number(dto.bigCartonPrice ?? carton.bigCartonPrice ?? 0);
    const smallPrice = Number(dto.smallCartonPrice ?? carton.smallCartonPrice ?? 0);
    const computedTotal = bigQuantity * bigPrice + smallQuantity * smallPrice;
    const newAmountPaid = Number(dto.amountPaid ?? carton.amountPaid ?? 0);
    const newTotalAmount = Number(dto.totalAmount ?? computedTotal);
    const newRemainingAmount = Number(dto.remainingAmount ?? Math.max(newTotalAmount - newAmountPaid, 0));

    let status = carton.status;
    if (dto.amountPaid !== undefined || dto.totalAmount !== undefined || dto.bigCartonsQuantity !== undefined || dto.smallCartonsQuantity !== undefined || dto.bigCartonPrice !== undefined || dto.smallCartonPrice !== undefined) {
      if (newAmountPaid >= newTotalAmount) {
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
        quantity: bigQuantity + smallQuantity,
        price: bigPrice + smallPrice,
        bigCartonsQuantity: bigQuantity,
        smallCartonsQuantity: smallQuantity,
        bigCartonPrice: bigPrice,
        smallCartonPrice: smallPrice,
        totalAmount: newTotalAmount,
        amountPaid: newAmountPaid,
        remainingAmount: newRemainingAmount,
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