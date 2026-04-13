import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

export class CreateExpenseDto {
  @Type(() => Date)
  @IsDate()
  date!: Date;

  @IsString()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  quantity!: number;

  @Type(() => Number)
  @IsNumber()
  price!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  categoryId!: string;
}
