import { WeekDay } from "@prisma/client";
import { IsNumber, IsOptional, Min } from "class-validator";

export class CreateOrderDto {
    date!: Date;

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
    N4!  : number;
    
    @IsNumber()
    ExtraPrice!: number;
    N1Price!: number;
    N2Price!: number;
    N3Price!: number;
    N4Price!: number;

    buyerId!: string;

    recurring!: boolean;

    recurringDays!: WeekDay[];
}