import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';

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
}
