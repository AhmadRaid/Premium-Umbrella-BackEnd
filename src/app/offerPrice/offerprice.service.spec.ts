import { Test, TestingModule } from '@nestjs/testing';
import { OfferpriceService } from './offerPrice.service';

describe('OfferpriceService', () => {
  let service: OfferpriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OfferpriceService],
    }).compile();

    service = module.get<OfferpriceService>(OfferpriceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
