import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEggLayingDto } from './dto/create-egg-laying.dto';

@Injectable()
export class EggLayingService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEggLayingDto) {

    const date = dto.date

    console.log(date)

    // Check if entry already exists for this date
    const existingEntry = await this.prisma.eggLaying.findFirst({
      where: {
          userId,
          date,
      },
    });

    if (existingEntry) {
      // Update existing entry
      return this.prisma.eggLaying.update({
        where: { id: existingEntry.id },
        data: {
          boxes: dto.boxes,
          cartons: dto.cartons,
        },
      });
    }

    return this.prisma.eggLaying.create({
      data: {
        date,
        boxes: dto.boxes,
        cartons: dto.cartons,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.eggLaying.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async findByMonth(userId: string, year: number, month: number) {

    const monthStr = month.toString().padStart(2, '0'); // Ensure month is 2 digits

    return this.prisma.eggLaying.findMany({
      where: {
        userId,
        date: {
          startsWith: `${year}-${monthStr}`
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const eggLaying = await this.prisma.eggLaying.findFirst({
      where: { id, userId },
    });

    if (!eggLaying) {
      throw new NotFoundException('Egg laying record not found');
    }

    return eggLaying;
  }

  async delete(id: string, userId: string) {
    const eggLaying = await this.prisma.eggLaying.findFirst({
      where: { id, userId },
    });

    if (!eggLaying) {
      throw new NotFoundException('Egg laying record not found');
    }

    return this.prisma.eggLaying.delete({
      where: { id },
    });
  }
}
