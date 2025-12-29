// src/client/dto/check-name.dto.ts
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CheckUserExistsDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  secondName: string;

  @IsNotEmpty()
  @IsString()
  thirdName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('SA')
  phone: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('SA')
  secondPhone: string;
}
