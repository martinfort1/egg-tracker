import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddEmployeePaymentDto {
  @IsNumber()
  amount!: number;
  
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string; // 'Salary' or 'Advance'
}
