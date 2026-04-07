import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class AddVaccineApplicationDto {
  @IsDateString()
  dateApplied: string;

  @IsNumber()
  vaccineCost: number;

  @IsNumber()
  labourCost: number;

  @IsOptional()
  @IsString()
  notes?: string;
}