import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsNumber()
  salary!: number;

  @IsNumber()
  @IsOptional()
  amountOwed?: number;
}