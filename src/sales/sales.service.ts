import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SaleStatus } from '@prisma/client';
@Injectable()
export class SalesService {

    constructor(private prisma: PrismaService) {}

    async create (dto: CreateSaleDto, userId: string){

        const buyer = await this.prisma.buyer.findFirst({
            where: {
                id: dto.buyerId,
                userId: userId
            }
        })

        if(!buyer) throw new Error('Buyer not found');

        const totalAmount = 
        dto.Extra * dto.ExtraPrice + 
        dto.N1 * dto.N1Price + 
        dto.N2 * dto.N2Price + 
        dto.N3 * dto.N3Price + 
        dto.N4 * dto.N4Price;

        const amountPaid = dto.amountPaid ?? 0;
        if(amountPaid > totalAmount) throw new Error('Amount paid cannot be greater than total amount');
        const remainingAmount = totalAmount - amountPaid;

        let status: SaleStatus;

        if(dto.amountPaid === totalAmount ){
             status = 'PAID';
        }
        if(dto.amountPaid === 0){
            status = 'UNPAID';
        } else {
            status = 'PARTIAL';
        }


        return this.prisma.sale.create({
            data: {
                Extra: dto.Extra,
                N1: dto.N1,
                N2: dto.N2,
                N3: dto.N3,
                N4: dto.N4,
                
                ExtraPrice: dto.ExtraPrice,
                N1Price: dto.N1Price,
                N2Price: dto.N2Price,
                N3Price: dto.N3Price,
                N4Price: dto.N4Price,

                totalAmount,
                amountPaid,
                remainingAmount,
                status,

                buyer: {
                    connect: { id: dto.buyerId }
                },
                userId,
                user: {
                    connect: { id: userId}
                }
            } as any
        })
    }
}
