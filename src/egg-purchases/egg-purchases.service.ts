import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEggPurchaseDto } from './dto/create-egg-purchase.dto';
import { UpdateEggPurchaseDto } from './dto/update-egg-purchase.dto';
import { SaleStatus } from '@prisma/client';

@Injectable()
export class EggPurchasesService {
  constructor(private prisma: PrismaService) {}

  private calculateTotals(dto: any) {
    const Extra = Number(dto.Extra) || 0;
    const N1 = Number(dto.N1) || 0;
    const N2 = Number(dto.N2) || 0;
    const N3 = Number(dto.N3) || 0;
    const N4 = Number(dto.N4) || 0;

    const ExtraBuyPrice = Number(dto.ExtraBuyPrice) || 0;
    const N1BuyPrice = Number(dto.N1BuyPrice) || 0;
    const N2BuyPrice = Number(dto.N2BuyPrice) || 0;
    const N3BuyPrice = Number(dto.N3BuyPrice) || 0;
    const N4BuyPrice = Number(dto.N4BuyPrice) || 0;

    const ExtraSellPrice = Number(dto.ExtraSellPrice) || 0;
    const N1SellPrice = Number(dto.N1SellPrice) || 0;
    const N2SellPrice = Number(dto.N2SellPrice) || 0;
    const N3SellPrice = Number(dto.N3SellPrice) || 0;
    const N4SellPrice = Number(dto.N4SellPrice) || 0;

    const totalCost =
      Extra * ExtraBuyPrice +
      N1 * N1BuyPrice +
      N2 * N2BuyPrice +
      N3 * N3BuyPrice +
      N4 * N4BuyPrice;

    const expectedRevenue =
      Extra * ExtraSellPrice +
      N1 * N1SellPrice +
      N2 * N2SellPrice +
      N3 * N3SellPrice +
      N4 * N4SellPrice;

    const estimatedProfit = expectedRevenue - totalCost;

    return {
      Extra,
      N1,
      N2,
      N3,
      N4,
      ExtraBuyPrice,
      N1BuyPrice,
      N2BuyPrice,
      N3BuyPrice,
      N4BuyPrice,
      ExtraSellPrice,
      N1SellPrice,
      N2SellPrice,
      N3SellPrice,
      N4SellPrice,
      totalCost,
      expectedRevenue,
      estimatedProfit,
    };
  }

  async create(userId: string, dto: CreateEggPurchaseDto) {
    const supplier = await this.prisma.buyer.findFirst({
      where: { id: dto.supplierId, userId },
    });

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    // Ensure supplier flag is enabled
    if (!supplier.isEggSupplier) {
      await this.prisma.buyer.update({
        where: { id: supplier.id },
        data: { isEggSupplier: true },
      });
    }

    const totals = this.calculateTotals(dto);
    const amountPaid = Math.min(Number(dto.amountPaid) || 0, totals.totalCost);
    const remainingAmount = Math.max(0, totals.totalCost - amountPaid);

    let status: SaleStatus = SaleStatus.UNPAID;
    if (amountPaid >= totals.totalCost && totals.totalCost > 0) {
      status = SaleStatus.PAID;
    } else if (amountPaid > 0) {
      status = SaleStatus.PARTIAL;
    }

    // Assign sequential purchase number
    const count = await this.prisma.eggPurchase.count({ where: { userId } });
    const purchaseNumber = count + 1;

    const purchase = await this.prisma.eggPurchase.create({
      data: {
        purchaseNumber,
        date: dto.date ? new Date(dto.date) : new Date(),
        Extra: totals.Extra,
        N1: totals.N1,
        N2: totals.N2,
        N3: totals.N3,
        N4: totals.N4,
        ExtraBuyPrice: totals.ExtraBuyPrice,
        N1BuyPrice: totals.N1BuyPrice,
        N2BuyPrice: totals.N2BuyPrice,
        N3BuyPrice: totals.N3BuyPrice,
        N4BuyPrice: totals.N4BuyPrice,
        ExtraSellPrice: totals.ExtraSellPrice,
        N1SellPrice: totals.N1SellPrice,
        N2SellPrice: totals.N2SellPrice,
        N3SellPrice: totals.N3SellPrice,
        N4SellPrice: totals.N4SellPrice,
        totalCost: totals.totalCost,
        expectedRevenue: totals.expectedRevenue,
        estimatedProfit: totals.estimatedProfit,
        amountPaid,
        remainingAmount,
        status,
        notes: dto.notes,
        supplierId: supplier.id,
        userId,
      },
      include: {
        supplier: true,
      },
    });

    if (amountPaid > 0) {
      await this.prisma.eggPurchasePayment.create({
        data: {
          paymentNumber: 1,
          amount: amountPaid,
          date: dto.date ? new Date(dto.date) : new Date(),
          note: 'Pago inicial registrado al crear la compra',
          eggPurchaseId: purchase.id,
          userId,
        },
      });
    }

    return purchase;
  }

  async findAll(userId: string, startDate?: string, endDate?: string, supplierId?: string) {
    return this.prisma.eggPurchase.findMany({
      where: {
        userId,
        ...(supplierId && supplierId !== 'all' ? { supplierId } : {}),
        ...(startDate || endDate
          ? {
              date: {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
              },
            }
          : {}),
      },
      include: {
        supplier: true,
        payments: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const purchase = await this.prisma.eggPurchase.findFirst({
      where: { id, userId },
      include: {
        supplier: true,
        payments: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Compra de huevos no encontrada');
    }

    return purchase;
  }

  async update(id: string, userId: string, dto: UpdateEggPurchaseDto) {
    const current = await this.findOne(id, userId);

    const merged = {
      ...current,
      ...dto,
    };

    const totals = this.calculateTotals(merged);

    // Sum existing payments
    const paymentsSum = await this.prisma.eggPurchasePayment.aggregate({
      where: { eggPurchaseId: id, userId },
      _sum: { amount: true },
    });

    const amountPaid = paymentsSum._sum.amount ?? current.amountPaid;
    const remainingAmount = Math.max(0, totals.totalCost - amountPaid);

    let status: SaleStatus = SaleStatus.UNPAID;
    if (amountPaid >= totals.totalCost && totals.totalCost > 0) {
      status = SaleStatus.PAID;
    } else if (amountPaid > 0) {
      status = SaleStatus.PARTIAL;
    }

    return this.prisma.eggPurchase.update({
      where: { id },
      data: {
        ...(dto.date ? { date: new Date(dto.date) } : {}),
        ...(dto.supplierId ? { supplierId: dto.supplierId } : {}),
        Extra: totals.Extra,
        N1: totals.N1,
        N2: totals.N2,
        N3: totals.N3,
        N4: totals.N4,
        ExtraBuyPrice: totals.ExtraBuyPrice,
        N1BuyPrice: totals.N1BuyPrice,
        N2BuyPrice: totals.N2BuyPrice,
        N3BuyPrice: totals.N3BuyPrice,
        N4BuyPrice: totals.N4BuyPrice,
        ExtraSellPrice: totals.ExtraSellPrice,
        N1SellPrice: totals.N1SellPrice,
        N2SellPrice: totals.N2SellPrice,
        N3SellPrice: totals.N3SellPrice,
        N4SellPrice: totals.N4SellPrice,
        totalCost: totals.totalCost,
        expectedRevenue: totals.expectedRevenue,
        estimatedProfit: totals.estimatedProfit,
        amountPaid,
        remainingAmount,
        status,
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: {
        supplier: true,
        payments: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.eggPurchase.delete({
      where: { id },
    });
  }

  async addPayment(id: string, userId: string, dto: { amount: number; date?: string; note?: string }) {
    const purchase = await this.findOne(id, userId);

    if (dto.amount <= 0) {
      throw new BadRequestException('El monto a abonar debe ser mayor a 0');
    }

    // Determine sequential paymentNumber
    const paymentCount = await this.prisma.eggPurchasePayment.count({
      where: { eggPurchaseId: id },
    });

    const payment = await this.prisma.eggPurchasePayment.create({
      data: {
        paymentNumber: paymentCount + 1,
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : new Date(),
        note: dto.note?.trim() || undefined,
        eggPurchaseId: id,
        userId,
      },
    });

    const paymentsSum = await this.prisma.eggPurchasePayment.aggregate({
      where: { eggPurchaseId: id },
      _sum: { amount: true },
    });

    const amountPaid = paymentsSum._sum.amount ?? 0;
    const remainingAmount = Math.max(0, purchase.totalCost - amountPaid);

    let status: SaleStatus = SaleStatus.UNPAID;
    if (amountPaid >= purchase.totalCost && purchase.totalCost > 0) {
      status = SaleStatus.PAID;
    } else if (amountPaid > 0) {
      status = SaleStatus.PARTIAL;
    }

    await this.prisma.eggPurchase.update({
      where: { id },
      data: {
        amountPaid,
        remainingAmount,
        status,
      },
    });

    return {
      payment,
      updatedPurchase: await this.findOne(id, userId),
    };
  }

  async getMetrics(userId: string) {
    const totals = await this.prisma.eggPurchase.aggregate({
      where: { userId },
      _sum: {
        totalCost: true,
        expectedRevenue: true,
        estimatedProfit: true,
        amountPaid: true,
        remainingAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const pendingCount = await this.prisma.eggPurchase.count({
      where: {
        userId,
        status: { in: [SaleStatus.UNPAID, SaleStatus.PARTIAL] },
      },
    });

    return {
      totalPurchases: totals._count.id,
      totalCost: totals._sum.totalCost ?? 0,
      totalExpectedRevenue: totals._sum.expectedRevenue ?? 0,
      totalEstimatedProfit: totals._sum.estimatedProfit ?? 0,
      totalPaid: totals._sum.amountPaid ?? 0,
      totalDebt: totals._sum.remainingAmount ?? 0,
      pendingCount,
    };
  }

  async getSupplierHistory(supplierId: string, userId: string) {
    const supplier = await this.prisma.buyer.findFirst({
      where: { id: supplierId, userId },
    });

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    const purchases = await this.prisma.eggPurchase.findMany({
      where: { supplierId, userId },
      include: {
        payments: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    });

    const totals = await this.prisma.eggPurchase.aggregate({
      where: { supplierId, userId },
      _sum: {
        totalCost: true,
        expectedRevenue: true,
        estimatedProfit: true,
        amountPaid: true,
        remainingAmount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      supplier,
      stats: {
        totalPurchases: totals._count.id,
        totalCost: totals._sum.totalCost ?? 0,
        totalExpectedRevenue: totals._sum.expectedRevenue ?? 0,
        totalEstimatedProfit: totals._sum.estimatedProfit ?? 0,
        totalPaid: totals._sum.amountPaid ?? 0,
        totalDebt: totals._sum.remainingAmount ?? 0,
      },
      purchases,
    };
  }
}
