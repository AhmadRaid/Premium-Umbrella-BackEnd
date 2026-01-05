import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OfferPricesEmployeeService } from './offerPrice.service';
import { CreateOfferPriceDto } from './dto/create-offer-price.dto';
import { OfferPrices } from 'src/schemas/offerPrice.schema';
import { UpdateOfferPriceDto } from './dto/update-offer-price.dto';
import { AddServiceToOfferDto } from './dto/add-service-to-offer.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';
import { AuthCompositeGuard } from 'src/common/guards/AuthCompositeGuard';
import { AuthRequest } from 'src/interfaces/AuthRequest';
import { ConvertOfferToOrderDto } from './dto/convert-offer-to-order.dto';

@Controller('offer-prices')
@UseGuards(AuthCompositeGuard)
export class OfferPricesEmployeeController {
  constructor(private readonly offerPricesService: OfferPricesEmployeeService) { }

  @Post()
  async create(@Body() createOfferPriceDto: any, @Req() req: AuthRequest) {
    return this.offerPricesService.create(createOfferPriceDto, req.user._id);
  }

  @Get()
  async findAll(): Promise<OfferPrices[]> {
    return this.offerPricesService.findAll();
  }

  @Post(':offerPriceId/convert-to-order')
  async convertToOrder(
    @Param('offerPriceId') offerPriceId: string,
    @Body() dto: ConvertOfferToOrderDto,
    @Req() req: AuthRequest,
  ) {
    return this.offerPricesService.convertOfferToOrder(offerPriceId, dto, req.user._id);
  }

  @Get('client/:clientId')
  async findByClientId(@Param('clientId') clientId: string): Promise<OfferPrices[]> {
    return this.offerPricesService.findByClientId(clientId);
  }

  @Get(':offerPriceId')
  async findOne(@Param('offerPriceId') offerPriceId: string): Promise<OfferPrices> {
    return this.offerPricesService.findOne(offerPriceId);
  }

  @Get(':offerPriceId/total-price')
  async calculateTotalPrice(@Param('offerPriceId') offerPriceId: string): Promise<{ totalPrice: number }> {
    const totalPrice = await this.offerPricesService.calculateTotalPrice(offerPriceId);
    return { totalPrice };
  }


  @Put(':offerPriceId')
  async update(
    @Param('offerPriceId') offerPriceId: string,
    @Body() updateOfferPriceDto: UpdateOfferPriceDto,
  ): Promise<OfferPrices> {
    return this.offerPricesService.update(offerPriceId, updateOfferPriceDto);
  }

  @Delete(':offerPriceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('offerPriceId') offerPriceId: string): Promise<void> {
    await this.offerPricesService.remove(offerPriceId);
  }

  @Post(':offerPriceId/services')
  async addService(
    @Param('offerPriceId') offerPriceId: string,
    @Body() addServiceDto: AddServiceToOfferDto,
  ): Promise<OfferPrices> {
    return this.offerPricesService.addServiceToOffer(offerPriceId, addServiceDto);
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