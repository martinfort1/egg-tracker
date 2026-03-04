import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()

export class AuthService {
    constructor(private prisma: PrismaService) {}
    
    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email }
        })
        if (existing) {
            throw new ConflictException('Email already exists');
        }
        
        const hash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hash
            }
        });

        return user;
    }
}
