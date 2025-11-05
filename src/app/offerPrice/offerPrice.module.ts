import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OfferPrices, OfferPriceSchema } from 'src/schemas/offerPrice.schema';
import { OfferPricesController } from './offerPrice.controller';
import { OfferPricesService } from './offerPrice.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OfferPrices.name, schema: OfferPriceSchema },
    ]),
  ],
  controllers: [OfferPricesController],
  providers: [OfferPricesService],
  exports: [OfferPricesService],
})
export class OfferPricesModule {}