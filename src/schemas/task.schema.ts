// src/schemas/task.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Branch } from './branch.schema'; // تأكد من استيراد مخطط الفرع

export type TaskDocument = Task & Document;

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId;

  @Prop({
    type: String,
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Prop({
    type: String,
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Prop({
    type: Date,
    validate: {
      validator: function (this: Task, value: Date) {
        return !this.startDate || value >= this.startDate;
      },
      message: 'Completion date must be after start date',
    },
  })
  completionDate: Date;

  @Prop({
    type: Date,
    required: true,
    validate: {
      validator: function (this: Task, value: Date) {
        return !this.endDate || value <= this.endDate;
      },
      message: 'Start date must be before end date',
    },
  })
  startDate: Date;

  @Prop({
    type: Date,
    validate: {
      validator: function (this: Task, value: Date) {
        return !this.startDate || value >= this.startDate;
      },
      message: 'End date must be after start date',
    },
  })
  endDate: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  public static get schema(): any {
    const taskSchema = SchemaFactory.createForClass(Task);
    taskSchema.virtual('branch', {
      ref: 'Branch',
      localField: 'branchId',
      foreignField: '_id',
      justOne: true,
    });
    return taskSchema;
  }
}

export const TaskSchema = Task.schema;