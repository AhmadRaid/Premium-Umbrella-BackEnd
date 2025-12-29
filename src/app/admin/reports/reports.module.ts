import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import {  Reports, ReportSchema } from 'src/schemas/reports.schema';
import { ReportsEmployeeService } from 'src/app/employee/reports/reports.service';
import { ReportsEmployeeController } from 'src/app/employee/reports/reports.controller';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: Reports.name, schema: ReportSchema }]),
      AuthModule,
    ],
  controllers: [ReportsController,ReportsEmployeeController],
  providers: [ReportsService,ReportsEmployeeService]
})
export class ReportsModule {}
