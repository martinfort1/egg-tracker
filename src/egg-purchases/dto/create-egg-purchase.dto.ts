import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEggPurchaseDto {
  @IsString()
  @IsNotEmpty()
  supplierId!: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  // Quantities
  @IsOptional()
  @IsNumber()
  @Min(0)
  Extra?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N1?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N2?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N3?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N4?: number;

  // Buy prices
  @IsOptional()
  @IsNumber()
  @Min(0)
  ExtraBuyPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N1BuyPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N2BuyPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N3BuyPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N4BuyPrice?: number;

  // Expected sell prices
  @IsOptional()
  @IsNumber()
  @Min(0)
  ExtraSellPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N1SellPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N2SellPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N3SellPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  N4SellPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
