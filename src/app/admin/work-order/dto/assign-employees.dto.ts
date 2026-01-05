import { IsOptional, IsString } from 'class-validator';

export class AssignEmployeesDto {
  @IsOptional()
  @IsString()
  assignedToEmployee1?: string;

  @IsOptional()
  @IsString()
  assignedToEmployee2?: string;

  @IsOptional()
  @IsString()
  assignedToEmployee3?: string;
}
