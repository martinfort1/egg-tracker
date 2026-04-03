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
import { FeedBagsService } from './feed-bags.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateFeedBagDto } from './dto/create-feed-bag.dto';
import { UpdateFeedBagDto } from './dto/update-feed-bag.dto';
import { UpdatePaymentDto } from '../sales/dto/UpdatePaymentDto.dto';
import type { User } from '@prisma/client';

@Controller('feed-bags')
export class FeedBagsController {
  constructor(private feedBagsService: FeedBagsService) {}

  @UseGuards(JwtGuard)
  @Post()
  createFeedBag(@GetUser('id') userId: string, 
  @Body() dto: CreateFeedBagDto) {
    return this.feedBagsService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  findAll(@GetUser() user: User) {
    return this.feedBagsService.findAll(user);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findOne(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.feedBagsService.findOne(id, user.id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  updateFeedBag(
    @Param('id') id: string,
    @GetUser() user: { id: string },
    @Body() dto: UpdateFeedBagDto,
  ) {
    return this.feedBagsService.update(id, user.id, dto);
  }

  @Patch(':id/payment')
  @UseGuards(JwtGuard)
  addPayment(
    @Param('id') id: string,
    @GetUser() user: { id: string },
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.feedBagsService.addPayment(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  deleteFeedBag(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.feedBagsService.delete(id, user.id);
  }
}