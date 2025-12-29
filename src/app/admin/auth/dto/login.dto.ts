import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {

  @IsString()
  @IsNotEmpty()
  readonly employeeId: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
  
  @IsOptional()
  readonly branch: string;
}
