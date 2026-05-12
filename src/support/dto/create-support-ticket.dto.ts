import { IsString, IsEmail, MinLength, MaxLength, IsEnum } from 'class-validator';

export class CreateSupportTicketDto {
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  subject?: string;

  @IsEnum(['bug', 'feature', 'billing', 'general', 'other'])
  category?: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  message?: string;
}
