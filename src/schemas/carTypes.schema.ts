import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CarTypeDocument = CarType & Document;

export enum CarSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

@Schema({
  timestamps: true,
})
export class CarType {
  @Prop({
    type: String,
    required: [true, 'Car Model name is required'],
    unique: true,
    trim: true
  })
  carModel: string;

  @Prop({ type: String, trim: true })
  description: string;

  @Prop({
    type: String,
 //   required: [true, 'Manufacturer is required'],
    trim: true
  })
  manufacturer: string;


  @Prop({
    type: String,
    enum: Object.values(CarSize),
   // required: [true, 'Size is required']
  })
  size: CarSize;

  @Prop({ type: Number, min: 0 })
  averagePrice?: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  // Virtual for admin who created/updated
  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  updatedBy?: Types.ObjectId;
}

export const CarTypeSchema = SchemaFactory.createForClass(CarType);