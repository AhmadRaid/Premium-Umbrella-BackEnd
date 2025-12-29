// src/app-imports.ts
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './database.config';
import { TranslationConfig } from './translation.config';
import { AuthModule } from '../app/admin/auth/auth.module';
import { UserModule } from '../app/admin/user/user.module';
import { ClientModule } from 'src/app/admin/client/client.module';
import { OrdersModule } from 'src/app/admin/orders/orders.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServiceModule } from 'src/app/admin/service/service.module';
import { ReportsModule } from 'src/app/admin/reports/reports.module';
import { InvoiceModule } from 'src/app/admin/invoice/invoice.module';
import { TasksModule } from 'src/app/admin/tasks/tasks.module';
import { BranchesModule } from 'src/app/admin/branches/branches.module';
import { OfferPricesModule } from 'src/app/admin/offerPrice/offerPrice.module';
import { TypeCarsModule } from 'src/app/admin/type-cars/type-cars.module';

// import { GoogleMapModule } from 'src/app/google-map/google-map.module';

export const AppImports = [
  ScheduleModule.forRoot(),
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'uploads'),
    serveRoot: '/',
  }),
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  ThrottlerModule.forRoot([
    {
      ttl: 60000,
      limit: 10,
    },
  ]),
  DatabaseConfig,
  TranslationConfig,
  AuthModule,
  UserModule,
  ClientModule,
  ServiceModule,
  ReportsModule,
    TypeCarsModule,
  TasksModule,
  BranchesModule,
  InvoiceModule,
  OfferPricesModule,
   OrdersModule
];
