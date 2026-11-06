import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EggPurchasesService } from './egg-purchases.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateEggPurchaseDto } from './dto/create-egg-purchase.dto';
import { UpdateEggPurchaseDto } from './dto/update-egg-purchase.dto';

@Controller('egg-purchases')
@UseGuards(JwtGuard)
export class EggPurchasesController {
  constructor(private readonly eggPurchasesService: EggPurchasesService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateEggPurchaseDto) {
    return this.eggPurchasesService.create(userId, dto);
  }

  @Get()
  findAll(
    @GetUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.eggPurchasesService.findAll(userId, startDate, endDate, supplierId);
  }

  @Get('metrics/summary')
  getMetrics(@GetUser('id') userId: string) {
    return this.eggPurchasesService.getMetrics(userId);
  }

  @Get('suppliers/:id/history')
  getSupplierHistory(@Param('id') supplierId: string, @GetUser('id') userId: string) {
    return this.eggPurchasesService.getSupplierHistory(supplierId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.eggPurchasesService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateEggPurchaseDto,
  ) {
    return this.eggPurchasesService.update(id, userId, dto);
  }

  @Patch(':id/payment')
  addPayment(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: { amount: number; date?: string; note?: string },
  ) {
    return this.eggPurchasesService.addPayment(id, userId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.eggPurchasesService.delete(id, userId);
  }
}
