import { PartialType } from '@nestjs/mapped-types';
import { CreateOfferPriceDto } from './create-offer-price.dto';

export class UpdateOfferPriceDto extends PartialType(CreateOfferPriceDto) {}