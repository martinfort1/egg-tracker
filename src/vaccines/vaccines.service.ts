import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { UpdateVaccineDto } from './dto/update-vaccine.dto';

@Injectable()
export class VaccinesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateVaccineDto) {
    return this.prisma.vaccine.create({
      data: {
        name: dto.name,
        durationDays: dto.durationDays,
        notes: dto.notes,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.vaccine.findMany({
      where: { userId },
      include: {
        applications: {
          orderBy: { dateApplied: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const vaccine = await this.prisma.vaccine.findFirst({
      where: { id, userId },
      include: {
        applications: {
          orderBy: { dateApplied: 'desc' },
        },
      },
    });

    if (!vaccine) {
      throw new NotFoundException('Vaccine not found');
    }

    return vaccine;
  }

  async update(id: string, userId: string, dto: UpdateVaccineDto) {
    const vaccine = await this.prisma.vaccine.findFirst({
      where: { id, userId },
    });

    if (!vaccine) {
      throw new NotFoundException('Vaccine not found');
    }

    return this.prisma.vaccine.update({
      where: { id },
      data: {
        name: dto.name ?? vaccine.name,
        durationDays: dto.durationDays ?? vaccine.durationDays,
        notes: dto.notes ?? vaccine.notes,
      },
      include: {
        applications: {
          orderBy: { dateApplied: 'desc' },
        },
      },
    });
  }

  async addApplication(vaccineId: string, userId: string, dto: { dateApplied: string; vaccineCost: number; labourCost: number; notes?: string }) {
    const vaccine = await this.prisma.vaccine.findFirst({
      where: { id: vaccineId, userId },
    });

    if (!vaccine) {
      throw new NotFoundException('Vaccine not found');
    }

    const totalCost = dto.vaccineCost + dto.labourCost;
    const dateApplied = new Date(dto.dateApplied);
    const nextApplicationDate = new Date(dateApplied);
    nextApplicationDate.setDate(nextApplicationDate.getDate() + vaccine.durationDays);

    return this.prisma.vaccineApplication.create({
      data: {
        dateApplied,
        vaccineCost: dto.vaccineCost,
        labourCost: dto.labourCost,
        totalCost,
        notes: dto.notes,
        vaccine: { connect: { id: vaccineId } },
        user: { connect: { id: userId } },
      },
    });
  }

  async delete(id: string, userId: string) {
    const vaccine = await this.prisma.vaccine.findFirst({
      where: { id, userId },
    });

    if (!vaccine) {
      throw new NotFoundException('Vaccine not found');
    }

    return this.prisma.vaccine.delete({
      where: { id },
    });
  }
}
