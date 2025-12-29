import { Module } from '@nestjs/common';
import { CarTypeService } from './type-cars.service';
import { CarTypeController } from './type-cars.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CarType, CarTypeSchema } from 'src/schemas/carTypes.schema';
import { AuthModule } from '../auth/auth.module';
import { CarTypeEmployeeController } from 'src/app/employee/type-cars/type-cars.controller';
import { CarTypeEmployeeService } from 'src/app/employee/type-cars/type-cars.service';

@Module({
      imports: [
        MongooseModule.forFeature([{ name: CarType.name, schema: CarTypeSchema }]),
        AuthModule,
      ],
  controllers: [CarTypeController,CarTypeEmployeeController],
  providers: [CarTypeService,CarTypeEmployeeService]
})
export class TypeCarsModule {}
