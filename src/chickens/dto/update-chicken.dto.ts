import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateChickenDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerChicken?: number;

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
