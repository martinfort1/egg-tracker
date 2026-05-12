import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { FeatureSuggestionService } from './feature-suggestion.service';
import { CreateFeatureSuggestionDto } from './dto/create-feature-suggestion.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('feature-suggestions')
export class FeatureSuggestionController {
  constructor(private readonly featureSuggestionService: FeatureSuggestionService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createSuggestion(
    @Body() dto: CreateFeatureSuggestionDto,
    @Request() req: any,
  ) {
    return this.featureSuggestionService.createSuggestion(dto, req.user.sub);
  }
}
