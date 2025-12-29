import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { ClientModule } from '../client/client.module';
import { OrdersModule } from '../orders/orders.module';
import { Invoice, InvoiceSchema } from 'src/schemas/invoice.schema';
import { InvoiceEmployeeService } from 'src/app/employee/invoice/invoice.service';
import { InvoiceEmployeeController } from 'src/app/employee/invoice/invoice.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    forwardRef(() => ClientModule),
    forwardRef(() => OrdersModule),
  ],
  controllers: [InvoiceController,InvoiceEmployeeController],
  providers: [InvoiceService,InvoiceEmployeeService],
  exports: [InvoiceService],
})
export class InvoiceModule {}