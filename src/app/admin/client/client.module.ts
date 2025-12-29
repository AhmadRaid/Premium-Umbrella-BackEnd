import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Client, ClientSchema } from 'src/schemas/client.schema';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { OrdersModule } from '../orders/orders.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { Orders, OrdersSchema } from 'src/schemas/orders.schema';
import { Invoice, InvoiceSchema } from 'src/schemas/invoice.schema';
import { ClientEmployeeService } from 'src/app/employee/client/client.service';
import { ClientEmployeeController } from 'src/app/employee/client/client.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: Orders.name, schema: OrdersSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
    AuthModule,
    forwardRef(() => OrdersModule),
    forwardRef(() => InvoiceModule),
  ],
  controllers: [ClientController,ClientEmployeeController],
  providers: [ClientService,ClientEmployeeService],
  exports: [ClientService, MongooseModule,ClientEmployeeService], // تأكد من تصدير الخدمة
})
export class ClientModule {}