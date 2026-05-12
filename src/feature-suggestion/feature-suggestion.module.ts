import { Module } from '@nestjs/common';
import { FeatureSuggestionController } from './feature-suggestion.controller';
import { FeatureSuggestionService } from './feature-suggestion.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeatureSuggestionController],
  providers: [FeatureSuggestionService],
})
export class FeatureSuggestionModule {}
