import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import { WorkOrderStatus } from 'src/common/enum/workOrderStatus.enum';

export type WorkOrderDocument = WorkOrder & Document;

@Schema({ timestamps: true })
export class WorkOrder {
  @Prop({ type: Types.ObjectId, ref: 'Orders', required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedToEmployee1: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedToEmployee2: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedToEmployee3: Types.ObjectId;

  @Prop({ type: String, enum: WorkOrderStatus, default: WorkOrderStatus.NEW })
  status: WorkOrderStatus;

  @Prop({
    type: [
      {
        status: { type: String, enum: Object.values(WorkOrderStatus), required: true },
        changedAt: { type: Date, required: true, default: Date.now },
        changedBy: { type: Types.ObjectId, ref: 'User' },
      },
    ],
    default: [],
  })
  statusHistory: { status: WorkOrderStatus; changedAt: Date; changedBy?: Types.ObjectId }[];

  @Prop({ type: String })
  notes: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const WorkOrderSchema = SchemaFactory.createForClass(WorkOrder);

// Add a pre-save hook to push status change into history when modified
type WorkOrderModel = Model<WorkOrderDocument>;

WorkOrderSchema.pre<WorkOrderDocument>('save', function (next) {
  if (this.isModified('status')) {
    if (!this.statusHistory) this.statusHistory = [];
    this.statusHistory.push({ status: this.status, changedAt: new Date() } as any);
  }
  next();
});
