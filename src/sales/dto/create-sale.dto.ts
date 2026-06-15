import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSaleDto {
  @IsOptional() date?: Date;

  @IsNumber()
  @Min(0)
  Extra!: number;

  @IsNumber()
  @Min(0)
  N1!: number;

  @IsNumber()
  @Min(0)
  N2!: number;

  @IsNumber()
  @Min(0)
  N3!: number;

  @IsNumber()
  @Min(0)
  N4!: number;

  @IsNumber()
  ExtraPrice!: number;

  @IsNumber()
  N1Price!: number;

  @IsNumber()
  N2Price!: number;

  @IsNumber()
  N3Price!: number;

  @IsNumber()
  N4Price!: number;

  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @IsString()
  buyerId!: string;
}
