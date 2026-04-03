import { Module } from '@nestjs/common';
import { CartonsController } from './cartons.controller';
import { CartonsService } from './cartons.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CartonsController],
  providers: [CartonsService],
})
export class CartonsModule {}