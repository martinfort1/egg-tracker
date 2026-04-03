import { IsNotEmpty, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateCartonDto {
  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

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
}