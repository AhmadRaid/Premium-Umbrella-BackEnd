import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkOrder, WorkOrderSchema } from 'src/schemas/workOrder.schema';
import { WorkOrderService } from './work-order.service';
import { WorkOrderController } from './work-order.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: WorkOrder.name, schema: WorkOrderSchema }])],
  controllers: [WorkOrderController],
  providers: [WorkOrderService],
  exports: [WorkOrderService],
})
export class WorkOrderModule {}
