import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedBagDto } from './dto/create-feed-bag.dto';
import { User, SaleStatus } from '@prisma/client';
import { UpdateFeedBagDto } from './dto/update-feed-bag.dto';

@Injectable()
export class FeedBagsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFeedBagDto) {
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

    const lastBag = await this.prisma.feedBag.findFirst({
      where: { userId },
      orderBy: { purchaseNumber: 'desc' },
      select: { purchaseNumber: true },
    });
    const purchaseNumber = (lastBag?.purchaseNumber ?? 0) + 1;

    return this.prisma.feedBag.create({
      data: {
        ...dto,
        purchaseNumber,
        date,
        status,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(user: User, startDateStr?: string, endDateStr?: string) {
    let gte: Date | undefined;
    let lte: Date | undefined;

    if (startDateStr) gte = new Date(startDateStr);
    if (endDateStr) {
      lte = new Date(endDateStr);
      lte.setHours(23, 59, 59, 999);
    }

    return this.prisma.feedBag.findMany({
      where: {
        user: { id: user.id },
        ...((gte || lte) && {
          date: {
            ...(gte && { gte }),
            ...(lte && { lte }),
          },
        }),
      },
      include: {
        payments: {
          orderBy: { date: 'desc' },
        },
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
      include: {
        payments: {
          orderBy: { date: 'desc' },
        },
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

  async addPayment(id: string, userId: string, dto: { amount: number; date?: string; note?: string }) {
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

    return this.prisma.$transaction(async (tx) => {
      await tx.feedBag.update({
        where: { id },
        data: {
          amountPaid: newAmountPaid,
          remainingAmount,
          status,
        },
      });

      const lastPayment = await tx.feedBagPayment.findFirst({
        where: { userId },
        orderBy: { paymentNumber: 'desc' },
        select: { paymentNumber: true },
      });
      const paymentNumber = (lastPayment?.paymentNumber ?? 0) + 1;

      await tx.feedBagPayment.create({
        data: {
          feedBagId: id,
          userId,
          paymentNumber,
          amount: dto.amount,
          date: dto.date ? new Date(dto.date) : new Date(),
          note: dto.note?.trim() || null,
        },
      });

      return tx.feedBag.findFirst({
        where: { id, userId },
        include: {
          payments: {
            orderBy: { date: 'desc' },
          },
        },
      });
    });
  }

  async getPaymentHistory(id: string, userId: string) {
    return this.prisma.feedBagPayment.findMany({
      where: {
        feedBagId: id,
        userId,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getAllPaymentsHistory(
    userId: string,
    startDateStr?: string,
    endDateStr?: string,
  ) {
    let gte: Date | undefined;
    let lte: Date | undefined;

    if (startDateStr) gte = new Date(startDateStr);
    if (endDateStr) {
      lte = new Date(endDateStr);
      lte.setHours(23, 59, 59, 999);
    }

    return this.prisma.feedBagPayment.findMany({
      where: {
        userId,
        ...((gte || lte) && {
          date: {
            ...(gte && { gte }),
            ...(lte && { lte }),
          },
        }),
      },
      include: {
        feedBag: {
          select: {
            id: true,
            purchaseNumber: true,
            date: true,
            amount: true,
            phase: true,
            price: true,
            totalAmount: true,
            remainingAmount: true,
            status: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getMetrics(user: User) {
    const feedBags = await this.prisma.feedBag.findMany({
      where: {
        user: { id: user.id },
      },
    });

    const totalOwed = feedBags.reduce((sum, bag) => sum + bag.remainingAmount, 0);
    const unpaidCount = feedBags.filter(bag => bag.status !== 'PAID').length;

    return {
      totalOwed,
      unpaidCount,
    };
  }

  async addBulkPayment(userId: string, dto: { amount: number; date?: string }) {
    const feedBags = await this.prisma.feedBag.findMany({
      where: {
        userId,
        status: { not: 'PAID' },
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (feedBags.length === 0) {
      throw new Error('No unpaid feed bags found');
    }

    let remainingPayment = dto.amount;

    return this.prisma.$transaction(async (tx) => {
      const lastPayment = await tx.feedBagPayment.findFirst({
        where: { userId },
        orderBy: { paymentNumber: 'desc' },
        select: { paymentNumber: true },
      });
      let currentPaymentNumber = lastPayment?.paymentNumber ?? 0;
      let feedBagsUpdated = 0;

      // Distribute payment across feed bags
      for (const feedBag of feedBags) {
        if (remainingPayment <= 0) break;

        const amountToApply = Math.min(remainingPayment, feedBag.remainingAmount);
        const newAmountPaid = feedBag.amountPaid + amountToApply;
        const newRemainingAmount = feedBag.totalAmount - newAmountPaid;

        let status: SaleStatus;
        if (newAmountPaid >= feedBag.totalAmount) status = 'PAID';
        else if (newAmountPaid === 0) status = 'UNPAID';
        else status = 'PARTIAL';

        await tx.feedBag.update({
          where: { id: feedBag.id },
          data: {
            amountPaid: newAmountPaid,
            remainingAmount: newRemainingAmount,
            status,
          },
        });

        currentPaymentNumber += 1;
        await tx.feedBagPayment.create({
          data: {
            feedBagId: feedBag.id,
            userId,
            paymentNumber: currentPaymentNumber,
            amount: amountToApply,
            date: dto.date ? new Date(dto.date) : new Date(),
            note: 'Pago general a proveedor',
          },
        });

        remainingPayment -= amountToApply;
        feedBagsUpdated += 1;
      }

      return {
        amountApplied: dto.amount - remainingPayment,
        feedBagsUpdated,
      };
    });
  }
}