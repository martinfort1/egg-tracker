import { PartialType } from '@nestjs/mapped-types';
import { CreateEggPurchaseDto } from './create-egg-purchase.dto';

export class UpdateEggPurchaseDto extends PartialType(CreateEggPurchaseDto) {}
