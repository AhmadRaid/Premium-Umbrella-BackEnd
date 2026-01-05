import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkOrderDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  clientId: string;

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
