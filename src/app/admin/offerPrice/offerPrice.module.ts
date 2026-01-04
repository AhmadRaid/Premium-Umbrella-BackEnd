import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OfferPrices, OfferPriceSchema } from 'src/schemas/offerPrice.schema';
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
  controllers: [OfferPricesEmployeeController],
  providers: [OfferPricesEmployeeService],
  exports: [OfferPricesEmployeeService],
})
export class OfferPricesModule {}