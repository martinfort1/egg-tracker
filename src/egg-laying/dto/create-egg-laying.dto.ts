import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateEggLayingDto {
  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsNumber()
  @IsNotEmpty()
  boxes!: number;

  @IsNumber()
  @IsNotEmpty()
  cartons!: number;

  @IsOptional()
  @IsString()
  chickenId?: string;
}
