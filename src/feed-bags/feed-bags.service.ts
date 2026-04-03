import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedBagDto } from './dto/create-feed-bag.dto';
import { User, SaleStatus } from '@prisma/client';
import { UpdateFeedBagDto } from './dto/update-feed-bag.dto';

@Injectable()
export class FeedBagsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateFeedBagDto) {
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

    return this.prisma.feedBag.create({
      data: {
        ...dto,
        date,
        status,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(user: User) {
    return this.prisma.feedBag.findMany({
      where: {
        user: { id: user.id },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const feedBag = await this.prisma.feedBag.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!feedBag) {
      throw new Error('Feed bag not found');
    }
    return feedBag;
  }

  async update(id: string, userId: string, dto: UpdateFeedBagDto) {
    const feedBag = await this.prisma.feedBag.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!feedBag) {
      throw new Error('Feed bag not found');
    }

    
    // Calculate new status if payment amounts are being updated
    let status = feedBag.status;
    if (dto.amountPaid !== undefined || dto.totalAmount !== undefined) {
      const newAmountPaid = dto.amountPaid ?? feedBag.amountPaid;
      const newTotalAmount = dto.totalAmount ?? feedBag.totalAmount;
      
      if (newAmountPaid === newTotalAmount) {
        status = 'PAID';
      } else if (newAmountPaid === 0) {
        status = 'UNPAID';
      } else {
        status = 'PARTIAL';
      }
    }
    const date = new Date(dto.date);
    
    return this.prisma.feedBag.update({
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
    const feedBag = await this.prisma.feedBag.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!feedBag) {
      throw new Error('Feed bag not found');
    }

    return this.prisma.feedBag.delete({
      where: {
        id,
      },
    });
  }

  async addPayment(id: string, userId: string, dto: { amount: number }) {
    const feedBag = await this.prisma.feedBag.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!feedBag) {
      throw new Error('Feed bag not found');
    }

    const newAmountPaid = feedBag.amountPaid + dto.amount;
    if (newAmountPaid > feedBag.totalAmount) {
      throw new Error('Amount paid cannot be greater than total amount');
    }

    const remainingAmount = feedBag.totalAmount - newAmountPaid;

    let status: SaleStatus;
    if (newAmountPaid >= feedBag.totalAmount) status = 'PAID';
    else if (newAmountPaid === 0) status = 'UNPAID';
    else status = 'PARTIAL';

    return this.prisma.feedBag.update({
      where: { id },
      data: {
        amountPaid: newAmountPaid,
        remainingAmount,
        status,
      },
    });
  }
}