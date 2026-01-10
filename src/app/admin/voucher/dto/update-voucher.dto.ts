import { CreateVoucherDto } from './create-voucher.dto';
import {
    IsOptional,
    IsString,
    IsEnum,
    IsMongoId,
    IsArray,
    ValidateNested,
    MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { VoucherStatus } from 'src/common/enum/voucher.enum';

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {
    
    @IsOptional()
    @IsEnum(VoucherStatus)
    status?: VoucherStatus;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    rejectionReason?: string;

    @IsOptional()
    @IsMongoId()
    updatedBy?: string;
}

// DTO خاص بالاعتماد
export class ApproveVoucherDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

// DTO خاص بالرفض
export class RejectVoucherDto {
    @IsString()
    @MaxLength(500)
    reason: string;
}