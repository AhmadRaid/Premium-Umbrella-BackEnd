import {
    IsEnum,
    IsNumber,
    IsString,
    IsOptional,
    IsDate,
    Min,
    MaxLength,
    MinLength,
    IsMongoId,
    IsArray,
    ValidateNested,
    IsBoolean,
    IsPositive,
    IsNotEmpty,
    IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, VoucherCategory, VoucherType } from 'src/common/enum/voucher.enum';


export class CreateVoucherDto {

    @IsEnum(VoucherType)
    type: VoucherType;

    @IsNumber()
    @Min(0.01)
    @IsPositive()
    amount: number;


    @IsDateString()
    date: Date;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    payeeName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    payerName?: string;

    @IsOptional()
    @IsMongoId()
    clientId?: string;


    @IsString()
    @MinLength(3)
    @MaxLength(500)
    description: string;

    // معلومات إضافية
    @IsMongoId()
    branchId: string;
}