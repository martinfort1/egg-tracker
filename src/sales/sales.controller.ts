import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdatePaymentDto } from './dto/UpdatePaymentDto.dto';

@Controller('sales')
export class SalesController {

    constructor(private salesService: SalesService) {}

    @Post()
    @UseGuards(JwtGuard)
    create(
        @Body() dto: CreateSaleDto,
        @GetUser() user: { id: string },
    ){
        return this.salesService.create(dto, user.id);
    }
    
    @Get()
    @UseGuards(JwtGuard)
    findAll(@GetUser('id') userId: string) {
        return this.salesService.findAll(userId);
    }

    @Get('/debts')
    @UseGuards(JwtGuard)
    findDebts(@GetUser('id') userId: string){
        return this.salesService.findDebts(userId);
    }
    @Get('/summary')
    @UseGuards(JwtGuard)
    getSummary(
        @GetUser('id') userId: string,
        @Query('period') period?: string
    ){
        return this.salesService.getSummary(userId, period);
    }

    @Get('/monthly')
    @UseGuards(JwtGuard)
    getMonthly(
        @GetUser('id') userId: string,
        @Query('period') period?: string
    ){
        return this.salesService.getMonthly(userId, period);
    }
    
    @Get('/dashboard')
    @UseGuards(JwtGuard)
    getDashboardData(
        @GetUser('id') userId: string,
        @Query('period') period?: string
    ) {
        return this.salesService.getDashboardData(userId, period);
    }

    @Get(':id')
    @UseGuards(JwtGuard)
    findOne(
        @Param('id') id: string,
        @GetUser('id') userId: string
    ){
        return this.salesService.findOne(id, userId);
    }


    @Get('buyer/:buyerId')
    @UseGuards(JwtGuard)
    findByBuyer(
        @Param('buyerId') buyerId: string,
        @GetUser('id') userId: string
    ){
        return this.salesService.findByBuyer(buyerId, userId);
    }

    @Patch(':id/payment')
    @UseGuards(JwtGuard)
    addPayment(
        @Param('id') id: string,
        @Body() dto: UpdatePaymentDto,
        @GetUser('id') userId: string
    ){
        return this.salesService.addPayment(id, userId, dto);
    }
    @Delete(':id')
    @UseGuards(JwtGuard)
    remove(
        @Param('id') id: string,
        @GetUser('id') userId: string
    ){
        return this.salesService.remove(id, userId);
    }

    
}
