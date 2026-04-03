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
import { CartonsService } from './cartons.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateCartonDto } from './dto/create-carton.dto';
import { UpdateCartonDto } from './dto/update-carton.dto';
import { UpdatePaymentDto } from '../sales/dto/UpdatePaymentDto.dto';
import type { User } from '@prisma/client';

@Controller('cartons')
export class CartonsController {
  constructor(private cartonsService: CartonsService) {}

  @UseGuards(JwtGuard)
  @Post()
  createCarton(@GetUser('id') userId: string, 
  @Body() dto: CreateCartonDto) 
  {
    return this.cartonsService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  findAll(@GetUser() user: User) 
  {
    return this.cartonsService.findAll(user);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findOne(@Param('id') id: string, 
  @GetUser() user: { id: string }) 
  {
    return this.cartonsService.findOne(id, user.id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  updateCarton(
    @Param('id') id: string,
    @GetUser() user: { id: string },
    @Body() dto: UpdateCartonDto,
  ) {
    return this.cartonsService.update(id, user.id, dto);
  }

  @Patch(':id/payment')
  @UseGuards(JwtGuard)
  addPayment(
    @Param('id') id: string,
    @GetUser() user: { id: string },
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.cartonsService.addPayment(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  deleteCarton(@Param('id') id: string, 
  @GetUser() user: { id: string }
  ) {
    return this.cartonsService.delete(id, user.id);
  }
}