// src/branches/dto/create-branch.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  secondPhone?: string;

  @IsString()
  @IsOptional()
  manager?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;
}
