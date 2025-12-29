// في ملف DTO جديد أو موجود (مثال: update-status.dto.ts)

import { IsEnum } from 'class-validator';

// تأكد من تعريف هذا Enum في مكان ما
export enum InvoiceStatusEnum {
  OPEN = 'open',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdateStatusDto {
  @IsEnum(InvoiceStatusEnum, { message: 'Invalid status provided.' })
  status: InvoiceStatusEnum;
}