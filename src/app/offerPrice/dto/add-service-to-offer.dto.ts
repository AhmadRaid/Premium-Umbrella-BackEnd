import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDate,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class GuaranteeDto {
  @IsOptional()
  @IsString()
  @IsEnum(['2 سنوات', '3 سنوات', '5 سنوات', '8 سنوات', '10 سنوات'])
  typeGuarantee?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  accepted?: boolean;
}

export class AddServiceToOfferDto {
  @IsNotEmpty()
  @IsString()
 // @IsEnum(['polish', 'protection', 'insulator', 'additions'])
  serviceType: string;

  @IsOptional()
  @IsString()
  dealDetails?: string;

  @IsOptional()
  @IsString()
  originalCarColor?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['glossy', 'matte', 'colored'])
  protectionFinish?: string;

  @IsOptional()
  @IsString()
  protectionSize?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['full', 'half', 'quarter', 'edges', 'other'])
  protectionCoverage?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['ceramic', 'carbon', 'crystal'])
  insulatorType?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['full', 'half', 'piece', 'shield', 'external'])
  insulatorCoverage?: string;

  @IsOptional()
  @IsString()
  @IsEnum([
    'internalAndExternal',
    'external',
    'internal',
    'seats',
    'piece',
    'water_polish',
  ])
  polishType?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['1', '2', '3'])
  polishSubType?: string;

  @IsOptional()
  @IsString()
  @IsEnum([
    'detailed_wash',
    'premium_wash',
    'leather_pedals',
    'blackout',
    'nano_interior_decor',
    'nano_interior_seats',
  ])
  additionType?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['full', 'external_only', 'internal_only', 'engine'])
  washScope?: string;

  @IsOptional()
  @IsNumber()
  servicePrice?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  serviceDate?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => GuaranteeDto)
  guarantee?: GuaranteeDto;
}