import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCartonDto {
  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  bigCartonsQuantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  smallCartonsQuantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  bigCartonPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  smallCartonPrice?: number;

  @IsNumber()
  @Min(0)
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