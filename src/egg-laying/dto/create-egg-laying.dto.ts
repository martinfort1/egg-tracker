import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

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
}
