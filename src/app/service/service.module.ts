import { forwardRef, Module } from '@nestjs/common';
import { ServicesController } from './service.controller';
import { ServicesService } from './service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from 'src/schemas/service.schema';
import { AuthModule } from '../auth/auth.module';
import { ClientModule } from '../client/client.module';
import { OrdersModule } from '../orders/orders.module';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
      imports: [
        MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
        forwardRef(() => ClientModule),
        forwardRef(() => InvoiceModule),
        forwardRef(() => OrdersModule),
        AuthModule,
      ],
  controllers: [ServicesController],
  providers: [ServicesService,MongooseModule]
})
export class ServiceModule {}
