import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateVaccineDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
