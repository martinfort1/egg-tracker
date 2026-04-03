import { IsNotEmpty, IsNumber, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class CreateFeedBagDto {
  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsNumber()
  @Min(0.01)
  price!: number;

  @IsNumber()
  @Min(0.01)
  totalAmount!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amountPaid?: number;

  @IsNumber()
  @Min(0)
  remainingAmount!: number;

  @IsNumber()
  @Min(1)
  @Max(2)
  phase!: number;
}