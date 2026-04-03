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
import { EmployeesService } from './employees.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import type { User } from '@prisma/client';

@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @UseGuards(JwtGuard)
  @Post()
  createEmployee(@GetUser('id') userId: string, @Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  findAll(@GetUser() user: User) {
    return this.employeesService.findAll(user);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findOne(@Param('id') id: string, 
  @GetUser() user: { id: string }) {
    return this.employeesService.findOne(id, user.id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  updateEmployee(
    @Param('id') id: string,
    @GetUser() user: { id: string },
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  deleteEmployee(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.employeesService.delete(id, user.id);
  }
}