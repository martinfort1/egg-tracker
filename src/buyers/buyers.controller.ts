import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import type { User } from '@prisma/client';

@Controller('buyers')
export class BuyersController {

    constructor(private buyersService: BuyersService) {}

    @UseGuards(JwtGuard)
    @Post()
    createBuyer(
        @GetUser('id') userId: string,
        @Body() dto: CreateBuyerDto
    ) {
        return this.buyersService.create(userId, dto);
    }

    @Get()
    @UseGuards(JwtGuard)
    findAll(@GetUser() user: User) {
        return this.buyersService.findAll(user);
    }

    @Get('/debts')
    @UseGuards(JwtGuard)
    findDebtors(
        @GetUser('id') userId: string
    ){
        return this.buyersService.findDebtors(userId);
    }

    @Get(':id')
    @UseGuards(JwtGuard)
    findOne(
        @Param('id') id: string,
        @GetUser() user: { id: string }
    ) {
        return this.buyersService.findOne(id, user.id)
    }

    @Get(':id/history')
    @UseGuards(JwtGuard)
    getBuyerHistory(
        @Param('id') id: string,
        @GetUser('id') userId: string
    ) {
        return this.buyersService.getBuyerHistory(id, userId);
    }

    @Put(':id')
    @UseGuards(JwtGuard)
    updateBuyer(
        @Param('id') id: string,
        @GetUser() user: { id: string },
        @Body() dto: CreateBuyerDto
    ) {
        return this.buyersService.update(id, user.id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtGuard)
    deleteBuyer(
        @Param('id') id: string,
        @GetUser() user: { id: string}
    ){
        return this.buyersService.delete(id, user.id);
    }

}
