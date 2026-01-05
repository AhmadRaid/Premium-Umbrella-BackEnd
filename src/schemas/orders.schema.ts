import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import { OrderStatus } from 'src/common/enum/orderStatus.enum';

export interface StatusHistory {
  status: OrderStatus;
  changedAt: Date;
  changedBy?: Types.ObjectId;
}

export type OrdersDocument = Orders & Document;

@Schema({ timestamps: true })
export class Orders {
  @Prop({
    type: String,
    unique: true,
    default: 'ORD-1001', // Default value, will be overridden by pre-save hook
  })
  orderNumber: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Client' })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Invoice' })
  invoiceId: Types.ObjectId;

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
    type: String,
    enum: OrderStatus,
    default: OrderStatus.NEW_ORDER,
  })
  status: OrderStatus;

  @Prop({
    type: [
      {
        status: { type: String, enum: OrderStatus, required: true },
        changedAt: { type: Date, required: true, default: Date.now },
        changedBy: { type: Types.ObjectId, ref: 'User' }, // اختياري
      },
    ],
    default: [],
  })
  statusHistory: StatusHistory[];

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, auto: true },
        serviceType: {
          type: String,
          required: true,
        },
        dealDetails: { type: String },
        protectionColor: { type: String },
        protectionFinish: {
          type: String,
        },
        protectionSize: { type: String },
        protectionCoverage: {
          type: String,
        },
        insulatorType: { type: String },
        insulatorCoverage: {
          type: String,
        },
         insulatorPercentage: {
          type: String,
        },
        polishType: {
          type: String,
        },
        polishSubType: { type: String },
        additionType: {
          type: String,
 
        },
        washScope: {
          type: String,
        },
        servicePrice: { type: Number },
        serviceDate: { type: Date },
        guarantee: {
          type: {
            typeGuarantee: {
              type: String,
            //  required: true,
            },
            startDate: { type: Date,  },
            endDate: { type: Date, },
            terms: { type: String },
            notes: { type: String, default: '' },
            sendApproveForAdmin: { type: Boolean, default: false },
            status: {
              type: String,
              enum: ['active', 'inactive'],
              default: 'inactive',
            },
            accepted: { type: Boolean, default: false },
          },
        },
      },
    ],
  })
  services: any;

  @Prop({ type: String })
  notes: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const OrdersSchema = SchemaFactory.createForClass(Orders);

// Define the OrdersModel type for type safety
type OrdersModel = Model<OrdersDocument>;

OrdersSchema.pre<OrdersDocument>('save', async function (next) {
  if (!this.isNew || this.orderNumber !== 'ORD-1001') {
    return next();
  }

  const model = this.constructor as OrdersModel;
  const lastOrder = await model.findOne({}, {}, { sort: { orderNumber: -1 } });

  if (lastOrder && lastOrder.orderNumber) {
    const lastNumber = parseInt(lastOrder.orderNumber.replace('ORD-', ''), 10);
    this.orderNumber = `ORD-${lastNumber + 1}`;
  } else {
    this.orderNumber = 'ORD-1001';
  }

  if (this.isModified('status')) {
    if (!this.statusHistory) {
      this.statusHistory = [];
    }

    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }

  next();
});
