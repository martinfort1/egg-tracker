import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { User, Buyer } from '@prisma/client';
import { UpdateBuyerDto } from './dto/update-buyer.dto';



@Injectable()
export class BuyersService {

    constructor(private prisma: PrismaService) {}

    create(userId: string, dto: CreateBuyerDto) {
        
        return this.prisma.buyer.create({
            data: {
                ...dto,
                userId
            }
        });
    }

    async findAll(user: User){
        return this.prisma.buyer.findMany({
            where: {
                user: { id: user.id}
            },
        });
    }

    async findOne(id: string, userId: string){
        const buyer = await this.prisma.buyer.findFirst({
            where: {
                id: id,
                userId: userId
            },
        });
        
        if (!buyer) {
            throw new Error('Buyer not found');
        }
        return buyer;
    }

    async update(id: string, userId: string, dto: UpdateBuyerDto){
        const buyer = await this.prisma.buyer.findFirst({
            where: {
                id,
                userId,
            },
        });
        if(!buyer) {
            throw new Error('Buyer not found');
        }
     
        return this.prisma.buyer.update({
            where: {
                id,
            },
            data: dto,
        })
    }

    async delete (id: string, userId: string) {
        const buyer = await this.prisma.buyer.findFirst({
            where: {
                id,
                userId,
            }
        });

        if(!buyer) {
            throw new Error('Buyer not found');    
        }

        return this.prisma.buyer.delete({
            where: {
                id,
            }
        })
    }
}
