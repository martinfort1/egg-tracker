import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChickenDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  pricePerChicken: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shippingCost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalCost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsBoolean()
  hasArrived?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  arrivalDate?: Date;
}
