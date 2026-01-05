import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConvertOfferToOrderDto {
  @IsNotEmpty()
  @IsString()
  carModel: string;

  @IsNotEmpty()
  @IsString()
  carManufacturer: string;

  @IsNotEmpty()
  @IsString()
  carColor: string;

  @IsNotEmpty()
  @IsString()
  carPlateNumber: string;

  @IsOptional()
  @IsString()
  carSize?: string;

  @IsOptional()
  @IsString()
  invoiceNotes?: string;

  @IsOptional()
  @IsString()
  assignedToEmployee1?: string;

  @IsOptional()
  @IsString()
  assignedToEmployee2?: string;

  @IsOptional()
  @IsString()
  assignedToEmployee3?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
