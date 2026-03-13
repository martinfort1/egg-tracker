import { IsNumber } from 'class-validator';

export class UpdatePaymentDto {
  @IsNumber()
  amount!: number;
}
