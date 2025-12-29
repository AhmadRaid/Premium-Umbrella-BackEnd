import { Test, TestingModule } from '@nestjs/testing';
import { OfferPricesController } from './offerPrice.controller';

describe('OfferpriceController', () => {
  let controller: OfferPricesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfferPricesController],
    }).compile();

    controller = module.get<OfferPricesController>(OfferPricesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
