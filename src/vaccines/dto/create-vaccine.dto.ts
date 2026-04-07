import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateVaccineDto {
  @IsString()
  name!: string;

  @IsNumber()
  durationDays!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
