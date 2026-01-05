import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Client } from './client.schema';

export type OfferPricesDocument = OfferPrices & Document;

@Schema({ timestamps: true })
export class OfferPrices {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Client' })
  client: Types.ObjectId; // يسمح بأن يكون كائن عميل أو مجرد ID

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId; // يسمح بأن يكون كائن عميل أو مجرد ID

  @Prop({ required: true, type: String })
    carModel: string;
  
    @Prop({ required: true, type: String })
    carManufacturer: string;
  
    @Prop({ required: true, type: String })
    carColor: string;
  
    @Prop({
      type: String,
      required: true,
      validate: {
        validator: (plate: string) => plate.length === 8 || plate.length === 7,
        message: 'Car plate must have exactly 8 or 7 characters',
      },
    })
    carPlateNumber: string[];
  
    @Prop({ type: String, required: true })
    carSize: string;
    
  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, auto: true },
        serviceType: {
          type: String,
          required: true,
          // enum: ['polish', 'protection', 'insulator', 'additions'],
        },
        dealDetails: { type: String },
        protectionColor: { type: String },
        protectionFinish: {
          type: String,
          //enum: ['glossy', 'matte', 'colored'],
        },
        protectionSize: { type: String },
        protectionCoverage: {
          type: String,
          // enum: ['full', 'half', 'quarter', 'edges', 'other'],
        },
        insulatorType: { type: String },
        insulatorCoverage: {
          type: String,
          //  enum: ['full', 'half', 'piece', 'shield', 'external'],
        },
           insulatorPercentage: {
          type: String,
          //  enum: ['full', 'half', 'piece', 'shield', 'external'],
        },
        polishType: {
          type: String,
          // enum: [
          //   'internalAndExternal',
          //   'external',
          //   'internal',
          //   'seats',
          //   'piece',
          //   'water_polish',
          // ],
        },
        polishSubType: { type: String },
        additionType: {
          type: String,
          // enum: [
          //   'detailed_wash',
          //   'premium_wash',
          //   'leather_pedals',
          //   'blackout',
          //   'nano_interior_decor',
          //   'nano_interior_seats',
          // ],
        },
        washScope: {
          type: String,
          //  enum: ['full', 'external_only', 'internal_only', 'engine'],
        },
        servicePrice: { type: Number },
        serviceDate: { type: Date },
        guarantee: {
          type: {
            typeGuarantee: {
              type: String,
              //  enum: ['2 سنوات', '3 سنوات', '5 سنوات', '8 سنوات', '10 سنوات'],
            },
            startDate: { type: Date },
            endDate: { type: Date },
            terms: { type: String },
            notes: { type: String, default: '' },
            status: {
              type: String,
              //  enum: ['active', 'inactive'],
              default: 'inactive',
            },
            accepted: { type: Boolean, default: false },
          },
        },
      },
    ],
  })
  services: Array<{
    _id: Types.ObjectId;
    serviceType: string;
    dealDetails?: string;
    protectionColor?: string;
    protectionFinish?: string;
    protectionSize?: string;
    protectionCoverage?: string;
    insulatorType?: string;
    insulatorPercentage?: string;
    insulatorCoverage?: string;
    polishType?: string;
    polishSubType?: string;
    additionType?: string;
    washScope?: string;
    servicePrice?: number;
    serviceDate?: Date;
    guarantee?: {
      typeGuarantee?: string;
      startDate?: Date;
      endDate?: Date;
      terms?: string;
      notes?: string;
      status?: string;
      accepted?: boolean;
    };
  }>;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Orders' })
  orderId?: Types.ObjectId;
}

export const OfferPriceSchema = SchemaFactory.createForClass(OfferPrices);