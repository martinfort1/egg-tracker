import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FulfillOrderDto } from './dto/fulfill-order-dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  create(
    @Body() dto: CreateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return this.ordersService.create(dto, userId);
  }

  @Get()
  @UseGuards(JwtGuard)
  findAll(
    @GetUser('id') userId: string,
  ) {
    return this.ordersService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.ordersService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return this.ordersService.update(
      id,
      dto,
      userId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.ordersService.remove(
      id,
      userId,
    );
  }

  @Post(':id/fulfill')
  @UseGuards(JwtGuard)
  fulfill(
    @Param('id') id: string,
    @Body() dto: FulfillOrderDto,
    @GetUser('id') userId: string,
  ) {
    return this.ordersService.fulfill(
      id,
      dto.amountPaid,
      userId,
    );
  }
}