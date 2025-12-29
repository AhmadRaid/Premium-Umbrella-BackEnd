import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Orders, OrdersSchema } from 'src/schemas/orders.schema';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ClientModule } from '../client/client.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { CarType, CarTypeSchema } from 'src/schemas/carTypes.schema';
import { OrdersEmployeeController } from 'src/app/employee/orders/orders.controller';
import { OrdersEmployeeService } from 'src/app/employee/orders/orders.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Orders.name, schema: OrdersSchema },
      { name: CarType.name, schema: CarTypeSchema },
    ]),
    forwardRef(() => ClientModule),
    forwardRef(() => InvoiceModule),
  ],
  controllers: [OrdersController, OrdersEmployeeController],
  providers: [OrdersService, OrdersEmployeeService],
  exports: [OrdersService, MongooseModule, OrdersEmployeeService],
})
export class OrdersModule {}
