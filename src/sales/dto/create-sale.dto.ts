import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSaleDto {
  @IsInt()
  @Min(0)
  Extra!: number;

  @IsInt()
  @Min(0)
  N1!: number;

  @IsInt()
  @Min(0)
  N2!: number;

  @IsInt()
  @Min(0)
  N3!: number;

  @IsInt()
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
