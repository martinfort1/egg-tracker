import { IsNumber, Min } from 'class-validator';

export class FulfillOrderDto {
  @IsNumber()
  @Min(0)
  amountPaid!: number;
}