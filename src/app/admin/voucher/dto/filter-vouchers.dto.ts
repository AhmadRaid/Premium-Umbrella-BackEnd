import { IsOptional, IsEnum, IsDateString, IsNumber, Min, Max, IsString } from 'class-validator';
import { PaymentMethod, VoucherCategory, VoucherStatus, VoucherType } from 'src/common/enum/voucher.enum';

export class FilterVouchersDto {
    @IsOptional()
    @IsEnum(VoucherType)
    type?: VoucherType;

    @IsOptional()
    @IsEnum(VoucherStatus)
    status?: VoucherStatus;

    @IsOptional()
    @IsEnum(VoucherCategory)
    category?: VoucherCategory;

    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minAmount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    maxAmount?: number;

    @IsOptional()
    @IsString()
    search?: string;
}