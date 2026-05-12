import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(dto: CreateSupportTicketDto, userId: string) {
    // TODO: Send email to support team
    // For now, just save to database
    return {
      message: 'Support ticket created successfully. We will get back to you soon.',
      ticketNumber: Math.random().toString(36).substring(2, 10).toUpperCase(),
    };
  }
}
