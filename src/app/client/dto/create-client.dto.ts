import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsArray,
  IsNotEmpty,
  ValidateIf,
  ValidateNested,
  IsNotEmptyObject,
  IsNumber,
  Min,
  Max,
  Matches,
  IsNumberString,
} from 'class-validator';
import { ServiceDto } from './service.dto';
import { Type, Transform } from 'class-transformer';
import { OrderStatus } from 'src/common/enum/orderStatus.enum';

export class createClientAndOrderDto {
  // Client Information
  @IsString({ message: 'يجب أن يكون الاسم الأول نصًا' })
  @IsNotEmpty({ message: 'الاسم الأول مطلوب' })
  firstName: string;

  @IsString({ message: 'يجب أن يكون الاسم الثاني نصًا' })
  @IsNotEmpty({ message: 'الاسم الثاني مطلوب' })
  secondName: string;

  @IsString({ message: 'يجب أن يكون الاسم الثالث نصًا' })
  @IsNotEmpty({ message: 'الاسم الأوسط مطلوب' })
  thirdName: string;

  @IsString({ message: 'يجب أن يكون الاسم الأخير نصًا' })
  @IsNotEmpty({ message: 'الاسم الأخير مطلوب' })
  lastName: string;

  @IsOptional()
  @IsEmail({}, { message: 'يجب أن يكون البريد الإلكتروني صالحًا' })
  email?: string;

  @IsString()
  @Matches(/^05\d{8}$/, {
    message: 'يجب أن يبدأ رقم الهاتف بـ 05 ويتكون من 10 أرقام',
  })
  phone: string;

  @IsOptional()
  @ValidateIf((o) => o.secondPhone !== undefined && o.secondPhone !== null && o.secondPhone !== '')
  @IsString({ message: 'يجب أن يكون رقم الهاتف نصًا' })
  @Matches(/^05\d{8}$/, {
    message: 'يجب أن يبدأ رقم الهاتف بـ 05 ويتكون من 10 أرقام',
  })
  secondPhone?: string;

  @IsString({ message: 'يجب أن يكون نوع العميل نصًا' })
  @IsEnum(['فرد', 'شركة', 'مسوق بعمولة'], {
    message: 'نوع العميل يجب أن يكون إما فرد أو شركة أو مسوق بعمولة',
  })
  clientType: string;

  @IsOptional()
  @IsString({ message: 'يجب أن يكون حالة الطلب نصًا' })
  @IsEnum([OrderStatus.NEW_ORDER, OrderStatus.MAINTENANCE], {
    message: 'حالة الطلب يجب أن يكون إما طلب جديد أو قيد الصيانة',
  })
  status: string;

  // @Transform(({ value }) => {
  //   if (value === null || value === undefined || value === '') {
  //     return 0;
  //   }
  //   if (typeof value === 'string' && !/^-?\d*\.?\d+$/.test(value)) {
  //     return NaN;
  //   }

  //   // تحويل النص إلى رقم
  //   const numericValue =
  //     typeof value === 'string' ? parseFloat(value) : Number(value);
  //   return isNaN(numericValue) ? 0 : numericValue;
  // })

  @IsString({ message: 'يجب أن يكون الفرع نصًا' })
  @IsNotEmpty({ message: 'الفرع مطلوب' })
  branch: string;


  @IsString({ message: 'يجب أن يكون موديل السيارة نصًا' })
  @ValidateIf((o) => o.services && o.services.length > 0)
  @IsNotEmpty({ message: 'موديل السيارة مطلوب عند إضافة خدمات' })
  carModel?: string;

  @IsString({ message: 'يجب أن يكون لون السيارة نصًا' })
  @ValidateIf((o) => o.services && o.services.length > 0)
  @IsNotEmpty({ message: 'لون السيارة مطلوب عند إضافة خدمات' })
  carColor?: string;

  @IsString({ message: 'يجب أن يكون رقم لوحة السيارة نص' })
  @ValidateIf((o) => o.services && o.services.length > 0)
  @IsNotEmpty({ message: 'رقم لوحة السيارة مطلوب عند إضافة خدمات' })
  carPlateNumber?: string;

  @IsString({ message: 'يجب أن يكون حجم السيارة نصًا' })
  @ValidateIf((o) => o.services && o.services.length > 0)
  @IsNotEmpty({ message: 'حجم السيارة مطلوب عند إضافة خدمات' })
  carSize?: string;

    @IsString({ message: 'يجب أن يكون الشركة المصنعة و نوع السيارة نصًا' })
  @ValidateIf((o) => o.services && o.services.length > 0)
  @IsNotEmpty({ message: 'الشركة المصنعة و نوع السيارة مطلوب عند إضافة خدمات' })
  carManufacturer?: string;

  @ValidateIf(
    (o) =>
      o.carModel !== undefined &&
      o.carColor !== undefined &&
      o.carPlateNumber !== undefined &&
      o.carSize !== undefined,
  )
  @IsArray({ message: 'الرجاء ارسال حقول كمصفوفة' })
  @IsOptional()
  services?: ServiceDto[];

  @IsOptional()
  invoiceNotes?: string;
}
