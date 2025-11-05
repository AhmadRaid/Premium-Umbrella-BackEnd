// src/schemas/branch.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BranchDocument = Branch & Document;

@Schema({ timestamps: true })
export class Branch {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true, match: /^\d{10}$/ })
  phone?: string;

  @Prop({ trim: true, match: /^\d{10}$/ })
  secondPhone?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  manager?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, default: 0, min: 0 })
  budget: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalExpenses: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);