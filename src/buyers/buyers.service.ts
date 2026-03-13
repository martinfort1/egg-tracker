import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { User, Buyer } from '@prisma/client';
import { UpdateBuyerDto } from './dto/update-buyer.dto';

@Injectable()
export class BuyersService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateBuyerDto) {
    console.log(userId, dto);
    return this.prisma.buyer.create({
      data: {
        ...dto,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(user: User) {
    return this.prisma.buyer.findMany({
      where: {
        user: { id: user.id },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const buyer = await this.prisma.buyer.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!buyer) {
      throw new Error('Buyer not found');
    }
    return buyer;
  }

  async update(id: string, userId: string, dto: UpdateBuyerDto) {
    const buyer = await this.prisma.buyer.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!buyer) {
      throw new Error('Buyer not found');
    }

    return this.prisma.buyer.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const buyer = await this.prisma.buyer.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!buyer) {
      throw new Error('Buyer not found');
    }

    return this.prisma.buyer.delete({
      where: {
        id,
      },
    });
  }

  async findDebtors(userId: string) {
    const sales = await this.prisma.sale.groupBy({
      by: ['buyerId'],
      where: {
        userId,
        status: {
          in: ['PARTIAL', 'UNPAID'],
        },
      },
      _sum: {
        remainingAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          remainingAmount: 'desc',
        },
      },
    });

    const buyerIds = sales.map((sale) => sale.buyerId);

    const buyers = await this.prisma.buyer.findMany({
      where: {
        id: { in: buyerIds },
      },
    });
    return sales.map((sale) => {
      const buyer = buyers.find((b) => b.id === sale.buyerId);

      return {
        buyerId: sale.buyerId,
        name: buyer?.name,
        totalDebt: sale._sum.remainingAmount ?? 0,
        pendingSales: sale._count.id,
      };
    });
  }

  async getBuyerHistory(buyerId: string, userId: string) {
    const buyer = await this.prisma.buyer.findFirst({
      where: {
        id: buyerId,
        userId,
      },
    });

    if (!buyer) {
      throw new Error('Buyer not found');
    }

    const sales = await this.prisma.sale.findMany({
      where: {
        buyerId,
        userId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    const totals = await this.prisma.sale.aggregate({
      where: {
        buyerId,
        userId,
      },
      _sum: {
        totalAmount: true,
        amountPaid: true,
        remainingAmount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      buyer,
      stats: {
        totalSales: totals._count.id,
        totalSpent: totals._sum.totalAmount ?? 0,
        totalPaid: totals._sum.amountPaid ?? 0,
        totalDebt: totals._sum.remainingAmount ?? 0,
      },
      sales,
    };
  }
}
