import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { VaccinesService } from './vaccines.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { UpdateVaccineDto } from './dto/update-vaccine.dto';
import { AddVaccineApplicationDto } from './dto/add-vaccine-application.dto';

@Controller('vaccines')
export class VaccinesController {
  constructor(private vaccinesService: VaccinesService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateVaccineDto) {
    return this.vaccinesService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  findAll(@GetUser('id') userId: string) {
    return this.vaccinesService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.vaccinesService.findOne(id, userId);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateVaccineDto,
  ) {
    return this.vaccinesService.update(id, userId, dto);
  }

  @Post(':id/applications')
  @UseGuards(JwtGuard)
  addApplication(
    @Param('id') vaccineId: string,
    @GetUser('id') userId: string,
    @Body() dto: AddVaccineApplicationDto,
  ) {
    return this.vaccinesService.addApplication(vaccineId, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  delete(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.vaccinesService.delete(id, userId);
  }
}
