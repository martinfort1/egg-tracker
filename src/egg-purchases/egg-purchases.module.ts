import { Module } from '@nestjs/common';
import { EggPurchasesController } from './egg-purchases.controller';
import { EggPurchasesService } from './egg-purchases.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EggPurchasesController],
  providers: [EggPurchasesService],
  exports: [EggPurchasesService],
})
export class EggPurchasesModule {}
