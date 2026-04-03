import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsNumber()
  salary!: number;

  @IsBoolean()
  @IsOptional()
  paidThisMonth?: boolean;

  @IsNumber()
  @IsOptional()
  amountOwed?: number;
}