import { Module } from '@nestjs/common';
import { FeedBagsController } from './feed-bags.controller';
import { FeedBagsService } from './feed-bags.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeedBagsController],
  providers: [FeedBagsService],
})
export class FeedBagsModule {}