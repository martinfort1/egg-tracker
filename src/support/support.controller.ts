import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createTicket(
    @Body() dto: CreateSupportTicketDto,
    @Request() req: any,
  ) {
    return this.supportService.createTicket(dto, req.user.sub);
  }
}
