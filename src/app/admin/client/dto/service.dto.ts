import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsDate,
  IsNumber,
  IsNotEmpty,
  ValidateIf,
  Min,
} from 'class-validator';
import { GuaranteeDto } from './guarantee.dto';

export class ServiceDto {
  @IsString()
  @IsNotEmpty()
 // @IsEnum(['تلميع', 'حماية', 'عازل حراري', 'إضافات'])
  serviceType: string;

  @IsString()
  @IsOptional()
  dealDetails?: string;

  @IsString()
  @IsOptional()
 // @IsEnum(['glossy', 'matte', 'colored'])
  protectionFinish?: string;

  @IsString()
  @IsOptional()
  protectionSize?: string;

  @IsString()
  @IsOptional()
  //@IsEnum(['full', 'half', 'quarter', 'edges', 'other'])
  protectionCoverage?: string;

  @IsString()
  @IsOptional()
  //@IsEnum(['ceramic', 'carbon', 'crystal'])
  insulatorType?: string;

  @IsString()
  @IsOptional()
 // @IsEnum(['full', 'half', 'piece', 'shield', 'external'])
  insulatorCoverage?: string;

    @IsString()
  @IsOptional()
 // @IsEnum(['full', 'half', 'piece', 'shield', 'external'])
  insulatorPercentage?: string;

  @IsString()
  @IsOptional()
 // @IsEnum(['external', 'internal', 'seats', 'piece', 'water_polish','internalAndExternal'])
  polishType?: string;

  @IsString()
  @IsOptional()
 // @IsEnum(['1', '2', '3'])
  polishSubType?: string;

  @IsString()
  @IsOptional()
  // @IsEnum([
  //   'detailed_wash',
  //   'premium_wash',
  //   'leather_pedals',
  //   'blackout',
  //   'nano_interior_decor',
  //   'nano_interior_seats',
  // ])
  additionType?: string;

  @IsString()
  @IsOptional()
//  @IsEnum(['full', 'external_only', 'internal_only', 'engine'])
  washScope?: string;

  @IsNumber({}, { message: 'سعر الخدمة يجب أن يكون رقمًا' })
  @Min(0, { message: 'سعر الخدمة يجب أن يكون على الأقل 0' })
  servicePrice: number;

  @IsString()
  @IsOptional()
  protectionColor?: number;
  
  @IsString()
  @IsOptional()
  originalCarColor?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  serviceDate?: Date;

  @ValidateNested()
  @Type(() => GuaranteeDto)
  @IsOptional()
  guarantee?: GuaranteeDto;
}