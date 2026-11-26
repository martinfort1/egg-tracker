import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ChickensService } from './chickens.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateChickenDto } from './dto/create-chicken.dto';
import { CreateChickenDeathDto } from './dto/create-chicken-death.dto';
import { UpdateChickenDto } from './dto/update-chicken.dto';
import type { User } from '@prisma/client';

@Controller('chickens')
export class ChickensController {
  constructor(private chickensService: ChickensService) {}

  @UseGuards(JwtGuard)
  @Post()
  createChicken(@GetUser('id') userId: string, @Body() dto: CreateChickenDto) {
    return this.chickensService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  findAll(@GetUser() user: User) {
    return this.chickensService.findAll(user);
  }

  @Get('current-count')
  @UseGuards(JwtGuard)
  getCurrentCount(@GetUser('id') userId: string) {
    return this.chickensService.getCurrentChickenCount(userId);
  }

  @Get('history')
  @UseGuards(JwtGuard)
  getHistory(@GetUser('id') userId: string) {
    return this.chickensService.getChickenHistory(userId);
  }

  @Get('laying-percentage-history')
  @UseGuards(JwtGuard)
  getLayingPercentageHistory(@GetUser('id') userId: string) {
    return this.chickensService.getLayingPercentageHistory(userId);
  }

  @Get('deaths')
  @UseGuards(JwtGuard)
  getDeathRecords(
    @GetUser('id') userId: string,
    @Param('chickenId') chickenId?: string,
  ) {
    return this.chickensService.getDeathRecords(userId, chickenId);
  }

  @Get('laying-percentage/:boxes/:cartons')
  @UseGuards(JwtGuard)
  getLayingPercentage(
    @GetUser('id') userId: string,
    @Param('boxes') boxes: string,
    @Param('cartons') cartons: string,
  ) {
    return this.chickensService.getLayingPercentage(userId, parseInt(boxes), parseInt(cartons));
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findOne(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.chickensService.findOne(id, user.id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  updateChicken(
    @Param('id') id: string,
    @GetUser() user: { id: string },
    @Body() dto: UpdateChickenDto,
  ) {
    return this.chickensService.update(id, user.id, dto);
  }

  @Patch(':id/payment')
  @UseGuards(JwtGuard)
  addPayment(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: { amount: number; date?: string; note?: string },
  ) {
    return this.chickensService.addPayment(id, userId, dto);
  }

  @Get(':id/payments')
  @UseGuards(JwtGuard)
  getPayments(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.chickensService.getPaymentHistory(id, userId);
  }

  @Patch(':id/alive')
  @UseGuards(JwtGuard)
  setAliveCount(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: { aliveCount: number; notes?: string },
  ) {
    return this.chickensService.setAliveCount(id, userId, dto.aliveCount, dto.notes);
  }

  @Put(':id/alive')
  @UseGuards(JwtGuard)
  updateAliveCount(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: { aliveCount: number; notes?: string },
  ) {
    return this.chickensService.setAliveCount(id, userId, dto.aliveCount, dto.notes);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  deleteChicken(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.chickensService.delete(id, user.id);
  }

  @Post(':id/deaths')
  @UseGuards(JwtGuard)
  addDeathRecord(
    @Param('id') chickenId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateChickenDeathDto,
  ) {
    return this.chickensService.addDeathRecord(userId, chickenId, dto);
  }
}
