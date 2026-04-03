import { IsOptional, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class UpdateFeedBagDto {
  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

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

  @IsNumber()
  @Min(1)
  @Max(2)
  @IsOptional()
  phase?: number;
}