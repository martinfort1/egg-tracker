import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsBoolean()
  @IsOptional()
  paidThisMonth?: boolean;

  @IsNumber()
  @IsOptional()
  amountOwed?: number;
}