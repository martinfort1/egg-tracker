import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBuyerDto {
  @IsString()
  @IsOptional()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isBuyer?: boolean;

  @IsBoolean()
  @IsOptional()
  isEggSupplier?: boolean;
}
