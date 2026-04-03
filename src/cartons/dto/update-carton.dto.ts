import { IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class UpdateCartonDto {
  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  totalAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amountPaid?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  remainingAmount?: number;
}