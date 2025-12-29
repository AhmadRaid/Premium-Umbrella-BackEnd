import { IsNotEmpty, IsMongoId, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddServiceToOfferDto } from './add-service-to-offer.dto';

export class CreateOfferPriceDto {
  @IsNotEmpty()
  @IsMongoId()
  clientId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddServiceToOfferDto)
  services?: AddServiceToOfferDto[];
}