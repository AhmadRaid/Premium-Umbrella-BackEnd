// src/tasks/dto/update-task.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from 'src/schemas/task.schema';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsNumber()
  @IsOptional()
  actualCost?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  completionDate?: Date;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
