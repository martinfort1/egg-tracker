import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SaleStatus } from '@prisma/client';
import { UpdatePaymentDto } from './dto/UpdatePaymentDto.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSaleDto, userId: string) {
    const buyer = await this.prisma.buyer.findFirst({
      where: {
        id: dto.buyerId,
        userId: userId,
      },
    });

    if (!buyer) throw new Error('Buyer not found');

    const totalAmount =
      dto.Extra * dto.ExtraPrice +
      dto.N1 * dto.N1Price +
      dto.N2 * dto.N2Price +
      dto.N3 * dto.N3Price +
      dto.N4 * dto.N4Price;

    const amountPaid = dto.amountPaid ?? 0;
    if (amountPaid > totalAmount)
      throw new Error('Amount paid cannot be greater than total amount');
    const remainingAmount = totalAmount - amountPaid;

    let status: SaleStatus;

    if (dto.amountPaid === totalAmount) {
      status = 'PAID';
    } else if (dto.amountPaid === 0) {
      status = 'UNPAID';
    } else {
      status = 'PARTIAL';
    }

    return this.prisma.sale.create({
      data: {
        Extra: dto.Extra,
        N1: dto.N1,
        N2: dto.N2,
        N3: dto.N3,
        N4: dto.N4,

        ExtraPrice: dto.ExtraPrice,
        N1Price: dto.N1Price,
        N2Price: dto.N2Price,
        N3Price: dto.N3Price,
        N4Price: dto.N4Price,

        totalAmount,
        amountPaid,
        remainingAmount,
        status,

        buyer: {
          connect: { id: dto.buyerId },
        },
        user: {
          connect: { id: userId },
        },
      } as any,
    });
  }

  async findAll(userId: string) {
    return this.prisma.sale.findMany({
      where: {
        userId,
      },
      include: {
        buyer: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        buyer: true,
      },
    });
    if (!sale) throw new Error('Sale not found');
    return sale;
  }

  async findByBuyer(buyerId: string, userId: string) {
    return this.prisma.sale.findMany({
      where: {
        buyerId,
        userId,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findDebts(userId: string) {
    return this.prisma.sale.findMany({
      where: {
        userId,
        status: {
          in: ['PARTIAL', 'UNPAID'],
        },
      },
      include: {
        buyer: true,
      },
      orderBy: {
        remainingAmount: 'desc',
      },
    });
  }

  async addPayment(id: string, userId: string, dto: UpdatePaymentDto) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!sale) throw new Error('Sale not found');

    const newAmountPaid = sale.amountPaid + dto.amount;
    const remainingAmount = sale.totalAmount - newAmountPaid;

    let status: SaleStatus;

    if (newAmountPaid >= sale.totalAmount) {
      status = 'PAID';
    } else if (newAmountPaid === 0) {
      status = 'UNPAID';
    } else {
      status = 'PARTIAL';
    }

    return this.prisma.sale.update({
      where: {
        id,
      },
      data: {
        amountPaid: newAmountPaid,
        remainingAmount,
        status,
      },
    });
  }

  async remove(id: string, userId: string) {
    const sale = this.prisma.sale.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!sale) throw new Error('Sale not found');

    return this.prisma.sale.delete({
      where: { id },
    });
  }

  private getStartDate(period?: string): Date | undefined {
    const now = new Date();

    if (!period) return undefined;

    switch (period) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));

      case '30d':
        return new Date(now.setDate(now.getDate() - 30));

      case '90d':
        return new Date(now.setDate(now.getDate() - 90));

      case '1y':
        return new Date(now.setFullYear(now.getFullYear() - 1));

      default:
        return undefined;
    }
  }

  async getSummary(userId: string, period?: string) {
    const startDate = this.getStartDate(period);
    const where = {
      userId,
      ...(startDate && {
        date: {
          gte: startDate,
        },
      }),
    };

    const salesCount = await this.prisma.sale.count({
      where,
    });

    const totals = await this.prisma.sale.aggregate({
      where,
      _sum: {
        totalAmount: true,
        amountPaid: true,
        remainingAmount: true,
      },
    });

    return {
      totalSales: salesCount,
      totalRevenues: totals._sum.totalAmount ?? 0,
      totalPaid: totals._sum.amountPaid ?? 0,
      totalDebts: totals._sum.remainingAmount ?? 0,
    };
  }

  async getMonthly(userId: string, period?: string) {
    const startDate = this.getStartDate(period);
    const where = {
      userId,
      ...(startDate && {
        date: {
          gte: startDate,
        },
      }),
    };
    const sales = await this.prisma.sale.findMany({
      where,
      select: {
        date: true,
        totalAmount: true,
      },
    });

    const monthly: Record<string, number> = {};

    for (const sale of sales) {
      const month = sale.date.toISOString().slice(0, 7); // YYYY-MM

      if (!monthly[month]) {
        monthly[month] = 0;
      }

      monthly[month] += sale.totalAmount;
    }

    return Object.entries(monthly).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }

  async getTopBuyers(where: any) {
    const sales = await this.prisma.sale.groupBy({
      by: ['buyerId'],
      where,
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 5,
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
        totalRevenue: sale._sum.totalAmount ?? 0,
      };
    });
  }

  async getDashboardData(userId: string, period?: string) {
    const startDate = this.getStartDate(period);
    const where = {
      userId,
      ...(startDate && {
        date: {
          gte: startDate,
        },
      }),
    };

    const summary = await this.getSummary(userId, period);
    const monthly = await this.getMonthly(userId, period);
    const topBuyers = await this.getTopBuyers(where);

    // Get expense data - all types
    const employeePayments = await this.prisma.employeePayment.aggregate({
      where: {
        userId,
        ...(startDate && {
          date: {
            gte: startDate,
          },
        }),
      },
      _sum: {
        amount: true,
      },
    });

    const vaccineApplications = await this.prisma.vaccineApplication.aggregate({
      where: {
        userId,
        ...(startDate && {
          dateApplied: {
            gte: startDate,
          },
        }),
      },
      _sum: {
        totalCost: true,
      },
    });

    const feedBags = await this.prisma.feedBag.aggregate({
      where: {
        userId,
        ...(startDate && {
          date: {
            gte: startDate,
          },
        }),
      },
      _sum: {
        totalAmount: true,
      },
    });

    const cartons = await this.prisma.carton.aggregate({
      where: {
        userId,
        ...(startDate && {
          date: {
            gte: startDate,
          },
        }),
      },
      _sum: {
        totalAmount: true,
      },
    });

    const chickens = await this.prisma.chicken.aggregate({
      where: {
        userId,
        ...(startDate && {
          date: {
            gte: startDate,
          },
        }),
      },
      _sum: {
        totalCost: true,
      },
    });

    const otherExpenses = await this.prisma.expense.aggregate({
      where: {
        userId,
        ...(startDate && {
          date: {
            gte: startDate,
          },
        }),
      },
      _sum: {
        totalAmount: true,
      },
    });

    const employeePaymentsTotal = employeePayments._sum.amount ?? 0;
    const vaccineCostsTotal = vaccineApplications._sum.totalCost ?? 0;
    const feedBagsTotal = feedBags._sum.totalAmount ?? 0;
    const cartonsTotal = cartons._sum.totalAmount ?? 0;
    const chickensTotal = chickens._sum.totalCost ?? 0;
    const otherExpensesTotal = otherExpenses._sum.totalAmount ?? 0;

    const expenses = {
      employeePayments: employeePaymentsTotal,
      vaccineCosts: vaccineCostsTotal,
      feedBags: feedBagsTotal,
      cartons: cartonsTotal,
      chickens: chickensTotal,
      other: otherExpensesTotal,
      totalExpenses: employeePaymentsTotal + vaccineCostsTotal + feedBagsTotal + cartonsTotal + chickensTotal + otherExpensesTotal,
    };

    return {
      summary,
      monthly,
      topBuyers,
      expenses,
    };
  }

  async getAnalytics(userId: string, period?: string) {
    const startDate = this.getStartDate(period);

    const sales = await this.prisma.sale.findMany({
      where:{
        userId,
        ...(startDate && {
          date: { gte:  startDate }
        })
      },
      select: {
        date: true,
        totalAmount: true
      }
    });

    const employeePayments = await this.prisma.employeePayment.findMany({
      where: {
        userId,
        ...(startDate && {
          date: {
            gte: startDate,
          },
        }),
      },
      select: {
        date: true,
        amount: true,
      },
    });

    const vaccineApplications = await this.prisma.vaccineApplication.findMany({
      where: {
        userId,
        ...(startDate && {
          dateApplied: {
            gte: startDate,
          },
        }),
      },
      select: {
        dateApplied: true,
        totalCost: true,
      },
    });

    const feedBags = await this.prisma.feedBag.findMany({
      where: {
        userId,
        ...(startDate && {
          date: {
            gte: startDate,
          },
        }),
      },
      select: {
        date: true,
        totalAmount: true,
      },
    });

    const cartons = await this.prisma.carton.findMany({
      where: {
        userId,
        ...(startDate && {
          date: {
            gte: startDate,
          },
        }),
      },
      select: {
        date: true,
        totalAmount: true,
      },
    });

    const chickens = await this.prisma.chicken.findMany({
      where: {
        userId,
        ...(startDate && {
          date: {
            gte: startDate,
          },
        }),
      },
      select: {
        date: true,
        totalCost: true,
      },
    });

    const otherExpenses = await this.prisma.expense.findMany({
      where: {
        userId,
        ...(startDate && {
          date: {
            gte: startDate,
          },
        }),
      },
      select: {
        date: true,
        totalAmount: true,
      },
    });
    
    // Grouping logic
    const groupedRevenue: Record<string, number> = {};
    const groupedExpenses: Record<string, number> = {};

    function getWeekNumber(date: Date) {
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const pastDays = (date.getTime() - firstDay.getTime()) / 86400000;
      return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    }

    function getKey(date: Date): string {
      if(period === '90d' || period === '1y'){
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      } else{
        const week = getWeekNumber(date);
        return `${date.getFullYear()}-W${week}`;
      }
    }

    // Group revenue from sales
    for( const sale of sales){
      const date = new Date(sale.date);
      const key = getKey(date);
      groupedRevenue[key] = (groupedRevenue[key] || 0) + sale.totalAmount;
    }

    // Group expenses
    for (const payment of employeePayments) {
      const date = new Date(payment.date);
      const key = getKey(date);
      groupedExpenses[key] = (groupedExpenses[key] || 0) + payment.amount;
    }

    for (const vaccine of vaccineApplications) {
      const date = new Date(vaccine.dateApplied);
      const key = getKey(date);
      groupedExpenses[key] = (groupedExpenses[key] || 0) + vaccine.totalCost;
    }

    for (const feedBag of feedBags) {
      const date = new Date(feedBag.date);
      const key = getKey(date);
      groupedExpenses[key] = (groupedExpenses[key] || 0) + feedBag.totalAmount;
    }

    for (const carton of cartons) {
      const date = new Date(carton.date);
      const key = getKey(date);
      groupedExpenses[key] = (groupedExpenses[key] || 0) + carton.totalAmount;
    }

    for (const chicken of chickens) {
      const date = new Date(chicken.date);
      const key = getKey(date);
      groupedExpenses[key] = (groupedExpenses[key] || 0) + chicken.totalCost;
    }

    for (const expense of otherExpenses) {
      const date = new Date(expense.date);
      const key = getKey(date);
      groupedExpenses[key] = (groupedExpenses[key] || 0) + expense.totalAmount;
    }

    // Merge all keys (revenue + expenses)
    const allKeys = new Set([...Object.keys(groupedRevenue), ...Object.keys(groupedExpenses)]);

    return Array.from(allKeys)
      .map((key) => {
        const revenue = groupedRevenue[key] || 0;
        const expenses = groupedExpenses[key] || 0;
        const profit = revenue - expenses;

        let sortDate: Date;
        let label: string;

        if (key.includes("W")) {
          const [year, week] = key.split("-W");
          sortDate = new Date(Number(year), 0, Number(week) * 7);
          label = `Week ${week}`;
        } else {
          const [year, month] = key.split("-");
          const date = new Date(Number(year), Number(month) - 1);
          sortDate = date;
          label = date.toLocaleString("en-US", {
            month: "numeric",
            year: "2-digit"
          }); 
        }

        return {
          label,
          revenue,
          expenses,
          profit,
          sortDate
        };
      })
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .map(({ label, revenue, expenses, profit }) => ({ label, revenue, expenses, profit }));
  }

  async update(id: string, userId: string, dto: UpdateSaleDto) {
    // 1. Verificar que la venta existe y pertenece al usuario
    const existingSale = await this.prisma.sale.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingSale) {
      throw new Error('Sale not found');
    }

    // 2. Merge de datos (usar valores existentes si no vienen en dto)
    const sale = {
      ...existingSale,
      ...dto,
    };

    // 3. Recalcular total
    const totalAmount =
      sale.Extra * sale.ExtraPrice +
      sale.N1 * sale.N1Price +
      sale.N2 * sale.N2Price +
      sale.N3 * sale.N3Price +
      sale.N4 * sale.N4Price;

    const amountPaid = sale.amountPaid ?? 0;

    if (amountPaid > totalAmount) {
      throw new Error('Amount paid cannot be greater than total');
    }

    const remainingAmount = totalAmount - amountPaid;

    // 4. Status correcto
    let status;

    if (amountPaid === totalAmount) {
      status = 'PAID';
    } else if (amountPaid === 0) {
      status = 'UNPAID';
    } else {
      status = 'PARTIAL';
    }

    // 5. Update en DB
    return this.prisma.sale.update({
      where: { id },
      data: {
        Extra: sale.Extra,
        N1: sale.N1,
        N2: sale.N2,
        N3: sale.N3,
        N4: sale.N4,

        ExtraPrice: sale.ExtraPrice,
        N1Price: sale.N1Price,
        N2Price: sale.N2Price,
        N3Price: sale.N3Price,
        N4Price: sale.N4Price,

        totalAmount,
        amountPaid,
        remainingAmount,
        status,
      },
    });
  }
}
