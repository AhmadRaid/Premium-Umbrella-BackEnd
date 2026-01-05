import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OfferPrices, OfferPriceSchema } from 'src/schemas/offerPrice.schema';
import { OfferPricesEmployeeService } from 'src/app/employee/offerPrice/offerPrice.service';
import { OfferPricesEmployeeController } from 'src/app/employee/offerPrice/offerPrice.controller';
import { Client, ClientSchema } from 'src/schemas/client.schema';
import { OrdersModule } from 'src/app/admin/orders/orders.module';
import { WorkOrderModule } from 'src/app/admin/work-order/work-order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OfferPrices.name, schema: OfferPriceSchema },
      { name: Client.name, schema: ClientSchema }, 
    ]),
    // Import Orders and WorkOrder so we can create orders and work orders from an offer
    OrdersModule,
    WorkOrderModule,
  ],
  controllers: [OfferPricesEmployeeController],
  providers: [OfferPricesEmployeeService],
  exports: [OfferPricesEmployeeService],
})
export class OfferPricesModule {}