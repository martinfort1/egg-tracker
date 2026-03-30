import { IsNumber, IsOptional } from "class-validator";

export class UpdateSaleDto {
  @IsOptional() @IsNumber() Extra?: number;
  @IsOptional() @IsNumber() N1?: number;
  @IsOptional() @IsNumber() N2?: number;
  @IsOptional() @IsNumber() N3?: number;
  @IsOptional() @IsNumber() N4?: number;

  @IsOptional() @IsNumber() ExtraPrice?: number;
  @IsOptional() @IsNumber() N1Price?: number;
  @IsOptional() @IsNumber() N2Price?: number;
  @IsOptional() @IsNumber() N3Price?: number;
  @IsOptional() @IsNumber() N4Price?: number;

  @IsOptional() @IsNumber() amountPaid?: number;
}