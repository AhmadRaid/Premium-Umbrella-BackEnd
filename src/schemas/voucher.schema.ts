import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoucherDocument = Voucher & Document;

@Schema({ timestamps: true })
export class Voucher {
  @Prop({ type: String, unique: true, default: 'VOU-1001' })
  voucherNumber: string;

  @Prop({ type: String, enum: ['PAYMENT', 'RECEIPT'], required: true })
  type: string; // PAYMENT (صرف) أو RECEIPT (قبض)

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Date, required: true, default: Date.now })
  date: Date;

  // المستلم (للسند الصرف)
  @Prop({ type: String })
  payeeName: string;

  // الدافع (للسند القبض)
  @Prop({ type: String })
  payerName: string;

  @Prop({ type: Types.ObjectId, ref: 'Client' })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, enum: ['DRAFT', 'APPROVED', 'REJECTED'], default: 'DRAFT' })
  status: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);

// توليد رقم السند تلقائياً
VoucherSchema.pre('save', async function (next) {
  if (this.isNew && (!this.voucherNumber || this.voucherNumber === 'VOU-1001')) {
    const model = this.constructor as any;
    const lastVoucher = await model.findOne({}, {}, { sort: { voucherNumber: -1 } });

    if (lastVoucher && lastVoucher.voucherNumber) {
      const lastNumber = parseInt(lastVoucher.voucherNumber.replace('VOU-', ''), 10);
      this.voucherNumber = `VOU-${lastNumber + 1}`;
    } else {
      this.voucherNumber = 'VOU-1001';
    }
  }
  next();
});