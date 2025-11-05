import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { OfferPricesService } from './offerPrice.service';
import { CreateOfferPriceDto } from './dto/create-offer-price.dto';
import { OfferPrices } from 'src/schemas/offerPrice.schema';
import { UpdateOfferPriceDto } from './dto/update-offer-price.dto';
import { AddServiceToOfferDto } from './dto/add-service-to-offer.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';

@Controller('offer-prices')
@UseGuards(JwtAuthGuard)
export class OfferPricesController {
  constructor(private readonly offerPricesService: OfferPricesService) {}

  @Post()
  async create(@Body() createOfferPriceDto: CreateOfferPriceDto): Promise<OfferPrices> {
    return this.offerPricesService.create(createOfferPriceDto);
  }

  @Get()
  async findAll(): Promise<OfferPrices[]> {
    return this.offerPricesService.findAll();
  }

  @Get('client/:clientId')
  async findByClientId(@Param('clientId') clientId: string): Promise<OfferPrices[]> {
    return this.offerPricesService.findByClientId(clientId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OfferPrices> {
    return this.offerPricesService.findOne(id);
  }

  @Get(':id/total-price')
  async calculateTotalPrice(@Param('id') id: string): Promise<{ totalPrice: number }> {
    const totalPrice = await this.offerPricesService.calculateTotalPrice(id);
    return { totalPrice };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOfferPriceDto: UpdateOfferPriceDto,
  ): Promise<OfferPrices> {
    return this.offerPricesService.update(id, updateOfferPriceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.offerPricesService.remove(id);
  }

  @Post(':id/services')
  async addService(
    @Param('id') id: string,
    @Body() addServiceDto: AddServiceToOfferDto,
  ): Promise<OfferPrices> {
    return this.offerPricesService.addServiceToOffer(id, addServiceDto);
  }

  @Put(':offerId/services/:serviceId')
  async updateService(
    @Param('offerId') offerId: string,
    @Param('serviceId') serviceId: string,
    @Body() updateServiceDto: Partial<AddServiceToOfferDto>,
  ): Promise<OfferPrices> {
    return this.offerPricesService.updateServiceInOffer(offerId, serviceId, updateServiceDto);
  }

  @Delete(':offerId/services/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeService(
    @Param('offerId') offerId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<void> {
    await this.offerPricesService.removeServiceFromOffer(offerId, serviceId);
  }
}