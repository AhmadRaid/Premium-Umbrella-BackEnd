import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// أنواع الخدمات المتاحة
export enum ServiceType {
  POLISH = 'تلميع',
  PROTECTION = 'حماية',
  INSULATOR = 'عازل حراري',
  ADDITIONS = 'إضافات',
}

// أنواع اللمعان للحماية
export enum ProtectionFinish {
  GLOSSY = 'لامع',
  MATTE = 'مطفى',
  COLORED = 'ملون',
}

// أنواع العوازل
export enum InsulatorType {
  CERAMIC = 'ceramic',
  CARBON = 'carbon',
  CRYSTAL = 'crystal',
}

// أنواع التلميع
export enum PolishType {
  EXTERNAL = 'خارجي',
  INTERNAL_EXTERNAL = 'داخلي و خارجي',
  INTERNAL = 'داخلي',
  SEATS = 'كراسي',
  PIECE = 'قطعة',
  WATER_POLISH = 'تلميع مائي',
}

// أنواع الإضافات
export enum AdditionType {
  DETAILED_WASH = 'detailed_wash',
  PREMIUM_WASH = 'premium_wash',
  LEATHER_PEDALS = 'leather_pedals',
  BLACKOUT = 'blackout',
  NANO_INTERIOR_DECOR = 'nano_interior_decor',
  NANO_INTERIOR_SEATS = 'nano_interior_seats',
}

// DTO للضمان
export class GuaranteeDto {
  @IsString()
  @IsNotEmpty()
  // @IsEnum(['2 سنوات', '3 سنوات', '5 سنوات', '8 سنوات', '10 سنوات'])
  typeGuarantee: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

// DTO للخدمة الأساسي
export class ServiceDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsString()
  @IsOptional()
  dealDetails?: string;

  @IsNumber()
  @IsOptional()
  servicePrice?: number;

  // حقول خاصة بخدمة الحماية
  @IsString()
  @IsOptional()
  originalCarColor?: string;

  @IsString()
  @IsOptional()
  protectionColor?: string;

  @IsString()
  @IsOptional()
  //  @IsEnum(ProtectionFinish)
  protectionFinish?: string;

  @IsString()
  @IsOptional()
  protectionSize?: string;

  @IsString()
  @IsOptional()
  protectionCoverage?: string;

  // حقول خاصة بخدمة العازل الحراري
  @IsString()
  @IsOptional()
  // @IsEnum(InsulatorType)
  insulatorType?: string;

  @IsString()
  @IsOptional()
  insulatorCoverage?: string;

  @IsString()
  @IsOptional()
  insulatorPercentage?: string;

  // حقول خاصة بخدمة التلميع
  @IsString()
  @IsOptional()
  // @IsEnum(PolishType)
  polishType?: string;

  @IsString()
  @IsOptional()
  polishSubType?: string;

  // حقول خاصة بخدمة الإضافات
  @IsString()
  @IsOptional()
  additionType?: string;

  @IsString()
  @IsOptional()
  washScope?: string;

  @ValidateNested()
  @Type(() => GuaranteeDto)
  guarantee: GuaranteeDto;
}

export class AddServicesToOrderDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsArray()
  @ArrayMinSize(1)
  // @ValidateNested({ each: true })
  // @Type(() => ServiceDto)
  services: ServiceDto[];
}
