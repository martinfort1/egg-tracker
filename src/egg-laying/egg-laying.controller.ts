import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EggLayingService } from './egg-laying.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateEggLayingDto } from './dto/create-egg-laying.dto';

@Controller('egg-laying')
export class EggLayingController {
  constructor(private eggLayingService: EggLayingService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateEggLayingDto) {
    return this.eggLayingService.create(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.eggLayingService.findAll(userId);
  }

  @UseGuards(JwtGuard)
  @Get('by-month/:year/:month')
  findByMonth(
    @GetUser('id') userId: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.eggLayingService.findByMonth(userId, parseInt(year), parseInt(month));
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.eggLayingService.findOne(id, userId);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.eggLayingService.delete(id, userId);
  }
}
