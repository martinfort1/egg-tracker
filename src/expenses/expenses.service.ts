import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async createCategory(userId: string, dto: CreateExpenseCategoryDto) {
    return this.prisma.expenseCategory.create({
      data: {
        name: dto.name,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAllCategories(userId: string) {
    return this.prisma.expenseCategory.findMany({
      where: { userId },
      include: {
        expenses: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneCategory(id: string, userId: string) {
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id, userId },
      include: {
        expenses: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    return category;
  }

  async deleteCategory(id: string, userId: string) {
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    return this.prisma.expenseCategory.delete({
      where: { id },
    });
  }

  // Expense methods
  async createExpense(userId: string, dto: CreateExpenseDto) {
    const totalAmount = dto.quantity * dto.price;

    const category = await this.prisma.expenseCategory.findFirst({
      where: { id: dto.categoryId, userId },
    });

    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    return this.prisma.expense.create({
      data: {
        date: new Date(dto.date),
        name: dto.name,
        quantity: dto.quantity,
        price: dto.price,
        totalAmount,
        description: dto.description,
        category: { connect: { id: dto.categoryId } },
        user: { connect: { id: userId } },
      },
    });
  }

  async findAllExpenses(userId: string) {
    return this.prisma.expense.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findExpensesByCategory(categoryId: string, userId: string) {
    return this.prisma.expense.findMany({
      where: { categoryId, userId },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOneExpense(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
      include: {
        category: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async deleteExpense(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
