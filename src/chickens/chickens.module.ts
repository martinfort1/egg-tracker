import { Module } from '@nestjs/common';
import { ChickensController } from './chickens.controller';
import { ChickensService } from './chickens.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChickensController],
  providers: [ChickensService],
  exports: [ChickensService],
})
export class ChickensModule {}
