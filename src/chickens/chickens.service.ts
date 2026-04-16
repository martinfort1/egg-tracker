import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChickenDto } from './dto/create-chicken.dto';
import { CreateChickenDeathDto } from './dto/create-chicken-death.dto';
import { UpdateChickenDto } from './dto/update-chicken.dto';
import { User } from '@prisma/client';

@Injectable()
export class ChickensService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateChickenDto) {
    const date = new Date(dto.date);

    return this.prisma.chicken.create({
      data: {
        date,
        amount: dto.amount,
        pricePerChicken: dto.pricePerChicken,
        shippingCost: dto.shippingCost,
        totalCost: dto.totalCost,
        user: { connect: { id: userId } },
      },
      include: {
        deaths: true,
      },
    });
  }

  async findAll(user: User) {
    return this.prisma.chicken.findMany({
      where: {
        userId: user.id,
      },
      include: {
        deaths: {
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const chicken = await this.prisma.chicken.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        deaths: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!chicken) {
      throw new NotFoundException('Chicken record not found');
    }
    return chicken;
  }

  async update(id: string, userId: string, dto: UpdateChickenDto) {
    const chicken = await this.prisma.chicken.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!chicken) {
      throw new NotFoundException('Chicken record not found');
    }

    const date = dto.date ? new Date(dto.date) : undefined;

    return this.prisma.chicken.update({
      where: { id },
      data: {
        ...(date && { date }),
        ...(dto.amount && { amount: dto.amount }),
        ...(dto.pricePerChicken && { pricePerChicken: dto.pricePerChicken }),
        ...(dto.shippingCost !== undefined && { shippingCost: dto.shippingCost }),
        ...(dto.totalCost && { totalCost: dto.totalCost }),
      },
      include: {
        deaths: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    const chicken = await this.prisma.chicken.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!chicken) {
      throw new NotFoundException('Chicken record not found');
    }

    return this.prisma.chicken.delete({
      where: { id },
    });
  }

  async getCurrentChickenCount(userId: string): Promise<number> {
    const chickens = await this.prisma.chicken.findMany({
      where: { userId },
      include: {
        deaths: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    let totalChickens = 0;
    for (const chicken of chickens) {
      totalChickens += chicken.amount;
    }

    // Subtract all deaths
    const allDeaths = await this.prisma.chickenDeath.findMany({
      where: { userId },
    });

    let totalDeaths = 0;
    for (const death of allDeaths) {
      totalDeaths += death.amount;
    }

    return totalChickens - totalDeaths;
  }

  async getChickenHistory(userId: string) {
    const chickens = await this.prisma.chicken.findMany({
      where: { userId },
      include: {
        deaths: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const deaths = await this.prisma.chickenDeath.findMany({
      where: { userId },
      orderBy: {
        date: 'asc',
      },
    });

    const history: Array<{
      date: Date;
      count: number;
      event: string;
    }> = [];

    let currentCount = 0;

    // Process all events chronologically
    let chickenIndex = 0;
    let deathIndex = 0;

    while (chickenIndex < chickens.length || deathIndex < deaths.length) {
      const nextChickenDate = chickens[chickenIndex]?.date;
      const nextDeathDate = deaths[deathIndex]?.date;

      let processChicken = false;

      if (nextChickenDate && nextDeathDate) {
        processChicken = nextChickenDate <= nextDeathDate;
      } else if (nextChickenDate) {
        processChicken = true;
      }

      if (processChicken) {
        currentCount += chickens[chickenIndex].amount;
        history.push({
          date: chickens[chickenIndex].date,
          count: currentCount,
          event: `Added ${chickens[chickenIndex].amount} chickens`,
        });
        chickenIndex++;
      } else {
        currentCount -= deaths[deathIndex].amount;
        history.push({
          date: deaths[deathIndex].date,
          count: currentCount,
          event: `${deaths[deathIndex].amount} chickens died`,
        });
        deathIndex++;
      }
    }

    return history;
  }

  async addDeathRecord(
    userId: string,
    chickenId: string,
    dto: CreateChickenDeathDto,
  ) {
    const chicken = await this.prisma.chicken.findFirst({
      where: {
        id: chickenId,
        userId,
      },
    });

    if (!chicken) {
      throw new NotFoundException('Chicken record not found');
    }

    const date = new Date(dto.date);

    return this.prisma.chickenDeath.create({
      data: {
        date,
        amount: dto.amount,
        notes: dto.notes,
        chicken: { connect: { id: chickenId } },
        user: { connect: { id: userId } },
      },
    });
  }

  async getDeathRecords(userId: string, chickenId?: string) {
    return this.prisma.chickenDeath.findMany({
      where: {
        userId,
        ...(chickenId && { chickenId }),
      },
      include: {
        chicken: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getLayingPercentage(
    userId: string,
    eggBoxes: number,
    eggCartons: number,
  ): Promise<number> {
    const totalEggs = eggBoxes * 360 + eggCartons * 30; // boxes = 12*30, cartons = 30
    const currentChickens = await this.getCurrentChickenCount(userId);

    if (currentChickens === 0) return 0;

    const percentage = (totalEggs / currentChickens * 100);

    return Math.min(percentage, 100); // Cap at 100%
  }

  async getLayingPercentageHistory(userId: string): Promise<Array<{ date: string; percentage: number }>> {
    const eggLayings = await this.prisma.eggLaying.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    const history = await this.getChickenHistory(userId);

    const result: Array<{ date: string; percentage: number }> = [];

    for (const eggLaying of eggLayings) {
      const eDate = new Date(eggLaying.date);
      const candidate = history
        .filter((h) => new Date(h.date) <= eDate)
        .pop();

      if (candidate) {
        const totalEggs = eggLaying.boxes * 360 + eggLaying.cartons * 30;
        const expectedEggsPerDay = candidate.count * 0.9;
        const percentage = Math.min((totalEggs / candidate.count) * 100, 100);

        result.push({
          date: eggLaying.date,
          percentage,
        });
      }
    }

    return result;
  }
}
