import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class GuaranteeDto {
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;
}

class ServiceDto {
  @IsNotEmpty()
  @IsString()
  serviceType: string;

    @IsOptional()
  @IsNumber()
  servicePrice: number;

  @IsOptional()
  //   @ValidateNested()
  //   @Type(() => GuaranteeDto)
  guarantee?: any;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderForExistingClientDto {

  @IsNotEmpty()
  @IsString()
  carModel: string;

  @IsNotEmpty()
  @IsString()
  carColor: string;

  @IsNotEmpty()
  @IsString()
  carPlateNumber: string;

  @IsNotEmpty()
  @IsString()
  carManufacturer: string;

  @IsOptional()
  @IsString()
  carSize?: string;


  @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => ServiceDto)
  services: any;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  invoiceNotes?: string;
}
