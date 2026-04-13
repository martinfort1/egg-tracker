import { Module } from '@nestjs/common';
import { EggLayingService } from './egg-laying.service';
import { EggLayingController } from './egg-laying.controller';

@Module({
  providers: [EggLayingService],
  controllers: [EggLayingController],
})
export class EggLayingModule {}
