import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  // Category endpoints
  @UseGuards(JwtGuard)
  @Post('categories')
  createCategory(
    @GetUser('id') userId: string,
    @Body() dto: CreateExpenseCategoryDto,
  ) {
    return this.expensesService.createCategory(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Get('categories')
  findAllCategories(@GetUser('id') userId: string) {
    return this.expensesService.findAllCategories(userId);
  }

  @UseGuards(JwtGuard)
  @Get('categories/:id')
  findOneCategory(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.expensesService.findOneCategory(id, userId);
  }

  @UseGuards(JwtGuard)
  @Delete('categories/:id')
  deleteCategory(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.expensesService.deleteCategory(id, userId);
  }

  // Expense endpoints
  @UseGuards(JwtGuard)
  @Post()
  createExpense(
    @GetUser('id') userId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.createExpense(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAllExpenses(@GetUser('id') userId: string) {
    return this.expensesService.findAllExpenses(userId);
  }

  @UseGuards(JwtGuard)
  @Get('by-category/:categoryId')
  findExpensesByCategory(
    @Param('categoryId') categoryId: string,
    @GetUser('id') userId: string,
  ) {
    return this.expensesService.findExpensesByCategory(categoryId, userId);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOneExpense(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.expensesService.findOneExpense(id, userId);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  deleteExpense(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.expensesService.deleteExpense(id, userId);
  }
}
