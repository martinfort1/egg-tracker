import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SaleStatus } from '@prisma/client/edge';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  private calculateNextOccurrence(
  currentDate: Date,
  recurringDays: string[],
): Date {
  const dayMap = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const currentDay = currentDate.getDay();

  const targetDays = recurringDays
    .map((day) => dayMap[day])
    .sort((a, b) => a - b);

  let daysToAdd = 7;

  for (const targetDay of targetDays) {
    const diff =
      (targetDay - currentDay + 7) % 7;

    if (diff > 0) {
      daysToAdd = diff;
      break;
    }
  }

  const nextDate = new Date(currentDate);
  nextDate.setDate(
    nextDate.getDate() + daysToAdd,
  );

  return nextDate;
}
  
async create(dto: CreateOrderDto, userId: string) {
  const buyer = await this.prisma.buyer.findFirst({
    where: {
      id: dto.buyerId,
      userId,
    },
  });

  if (!buyer) {
    throw new Error('Buyer not found');
  }

  const totalAmount =
    dto.Extra * dto.ExtraPrice +
    dto.N1 * dto.N1Price +
    dto.N2 * dto.N2Price +
    dto.N3 * dto.N3Price +
    dto.N4 * dto.N4Price;

  return this.prisma.order.create({
    data: {
      date: new Date(dto.date),

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

      recurring: dto.recurring,
      recurringDays: dto.recurringDays,

      buyerId: dto.buyerId,
      userId,
    },
  });
}

  async findAll(userId: string) {
  return this.prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      buyer: true,
    },
    orderBy: {
      date: 'asc',
    },
  });
}
  async findOne(
  id: string,
  userId: string,
) {
  const order = await this.prisma.order.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      buyer: true,
    },
  });

  if (!order) {
    throw new NotFoundException(
      'Order not found',
    );
  }
  console.log(order);
  return order;
}

  async update(
  id: string,
  dto: UpdateOrderDto,
  userId: string,
) {
  const order = await this.prisma.order.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!order) {
    throw new NotFoundException(
      'Order not found',
    );
  }

  if (order.status === 'FULFILLED') {
    throw new BadRequestException(
      'Cannot edit a fulfilled order',
    );
  }
  const Extra = dto.Extra ?? order.Extra;
  const N1 = dto.N1 ?? order.N1;
  const N2 = dto.N2 ?? order.N2;
  const N3 = dto.N3 ?? order.N3;
  const N4 = dto.N4 ?? order.N4;

  const ExtraPrice =
    dto.ExtraPrice ?? order.ExtraPrice;

  const N1Price =
    dto.N1Price ?? order.N1Price;

  const N2Price =
    dto.N2Price ?? order.N2Price;

  const N3Price =
    dto.N3Price ?? order.N3Price;

  const N4Price =
    dto.N4Price ?? order.N4Price;

  const totalAmount =
    Extra * ExtraPrice +
    N1 * N1Price +
    N2 * N2Price +
    N3 * N3Price +
    N4 * N4Price;

  return this.prisma.order.update({
    where: {
      id,
      userId,
    },
    data: {
      ...dto,
      totalAmount,
      date: dto.date
        ? new Date(dto.date)
        : undefined,
    },
  });
}

async remove(
  id: string,
  userId: string,
) {
  const order = await this.prisma.order.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!order) {
    throw new NotFoundException(
      'Order not found',
    );
  }

  return this.prisma.order.update({
    where: {
      id,
      userId,
    },
    data: {
      status: 'CANCELLED',
    },
  });
}

  async fulfill(
  id: string,
  amountPaid: number,
  userId: string,
) {
  const order = await this.prisma.order.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  if (order.status !== 'PENDING') {
    throw new BadRequestException(
      'Order is already fulfilled or cancelled',
    );
  }

  if (amountPaid > order.totalAmount) {
    throw new BadRequestException(
      'Amount paid cannot be greater than total amount',
    );
  }

  const remainingAmount =
    order.totalAmount - amountPaid;

  let status: SaleStatus;

  if (amountPaid === order.totalAmount) {
    status = 'PAID';
  } else if (amountPaid === 0) {
    status = 'UNPAID';
  } else {
    status = 'PARTIAL';
  }

  return this.prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        date: new Date(),

        Extra: order.Extra,
        N1: order.N1,
        N2: order.N2,
        N3: order.N3,
        N4: order.N4,

        ExtraPrice: order.ExtraPrice,
        N1Price: order.N1Price,
        N2Price: order.N2Price,
        N3Price: order.N3Price,
        N4Price: order.N4Price,

        totalAmount: order.totalAmount,

        amountPaid,
        remainingAmount,
        status,

        buyerId: order.buyerId,
        userId: order.userId,
      },
    });

    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: 'FULFILLED',
      },
    });

    if (
      order.recurring &&
      order.recurringDays.length > 0
    ) {
      const nextDate = this.calculateNextOccurrence(
        order.date,
        order.recurringDays,
      );

      await tx.order.create({
        data: {
          date: nextDate,

          Extra: order.Extra,
          N1: order.N1,
          N2: order.N2,
          N3: order.N3,
          N4: order.N4,

          ExtraPrice: order.ExtraPrice,
          N1Price: order.N1Price,
          N2Price: order.N2Price,
          N3Price: order.N3Price,
          N4Price: order.N4Price,

          totalAmount: order.totalAmount,

          recurring: true,
          recurringDays: order.recurringDays,

          buyerId: order.buyerId,
          userId: order.userId,
        },
      });
    }

    return sale;
  });
}
}