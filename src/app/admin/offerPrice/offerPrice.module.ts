import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OfferPrices, OfferPriceSchema } from 'src/schemas/offerPrice.schema';
import { OfferPricesController } from './offerPrice.controller';
import { OfferPricesService } from './offerPrice.service';
import { OfferPricesEmployeeService } from 'src/app/employee/offerPrice/offerPrice.service';
import { OfferPricesEmployeeController } from 'src/app/employee/offerPrice/offerPrice.controller';
import { Client, ClientSchema } from 'src/schemas/client.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OfferPrices.name, schema: OfferPriceSchema },
      { name: Client.name, schema: ClientSchema }, 
    ]),
  ],
  controllers: [OfferPricesController,OfferPricesEmployeeController],
  providers: [OfferPricesService,OfferPricesEmployeeService],
  exports: [OfferPricesService],
})
export class OfferPricesModule {}