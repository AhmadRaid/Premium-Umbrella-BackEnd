import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOfferPriceDto } from './dto/create-offer-price.dto';
import { UpdateOfferPriceDto } from './dto/update-offer-price.dto';
import { AddServiceToOfferDto } from './dto/add-service-to-offer.dto';
import { OfferPrices, OfferPricesDocument } from 'src/schemas/offerPrice.schema';
import { OrdersEmployeeService } from 'src/app/employee/orders/orders.service';
import { WorkOrderService } from 'src/app/admin/work-order/work-order.service';
import { ConvertOfferToOrderDto } from './dto/convert-offer-to-order.dto';
import { CarSize } from 'src/schemas/carTypes.schema';

@Injectable()
export class OfferPricesEmployeeService {
  constructor(
    @InjectModel(OfferPrices.name)
    private offerPriceModel: Model<OfferPricesDocument>,
    private readonly ordersService: OrdersEmployeeService,
    private readonly workOrderService: WorkOrderService,
  ) { }

  async create(createOfferPriceDto: any, userId: string): Promise<OfferPrices> {
    const data = {
      ...createOfferPriceDto,
      client: new Types.ObjectId(createOfferPriceDto.clientId),
      createdBy: new Types.ObjectId(createOfferPriceDto.userId),
    };
    const createdOffer = new this.offerPriceModel(data);
    return createdOffer.save();
  }

  async findAll(): Promise<OfferPrices[]> {
    return this.offerPriceModel
      .find({ isDeleted: false })
      .populate('client', '_id firstName secondName thirdName lastName clientNumber phone')
      .exec();
  }

  async findOne(id: string): Promise<OfferPrices> {
    const offer = await this.offerPriceModel
      .findOne({ _id: id, isDeleted: false })
      .populate('client', '_id firstName secondName thirdName lastName clientNumber')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer price with ID ${id} not found`);
    }

    return offer;
  }

  async findByClientId(clientId: string): Promise<OfferPrices[]> {
    return this.offerPriceModel
      .find({
        clientId: new Types.ObjectId(clientId),
        isDeleted: false
      })
      .populate('client', '_id firstName secondName thirdName lastName clientNumber')
      .exec();
  }

  async update(
    id: string,
    updateOfferPriceDto: UpdateOfferPriceDto,
  ): Promise<OfferPrices> {
    const updatedOffer = await this.offerPriceModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateOfferPriceDto,
        { new: true },
      )
      .populate('client', '_id firstName secondName thirdName lastName clientNumber')
      .exec();

    if (!updatedOffer) {
      throw new NotFoundException(`Offer price with ID ${id} not found`);
    }

    return updatedOffer;
  }

  async remove(id: string): Promise<OfferPrices> {
    const deletedOffer = await this.offerPriceModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true },
      )
      .exec();

    if (!deletedOffer) {
      throw new NotFoundException(`Offer price with ID ${id} not found`);
    }

    return deletedOffer;
  }

  async addServiceToOffer(
    id: string,
    addServiceDto: AddServiceToOfferDto,
  ): Promise<OfferPrices> {
    const offer = await this.offerPriceModel
      .findOne({ _id: id, isDeleted: false })
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer price with ID ${id} not found`);
    }

    offer.services.push(addServiceDto as any);
    return offer.save();
  }

  async updateServiceInOffer(
    offerId: string,
    serviceId: string,
    updateServiceDto: Partial<AddServiceToOfferDto>,
  ): Promise<OfferPrices> {
    // Convert serviceId to ObjectId for the query
    const serviceObjectId = new Types.ObjectId(serviceId);

    const updateQuery: any = {};
    Object.keys(updateServiceDto).forEach(key => {
      updateQuery[`services.$.${key}`] = updateServiceDto[key];
    });

    const updatedOffer = await this.offerPriceModel
      .findOneAndUpdate(
        {
          _id: offerId,
          isDeleted: false,
          'services._id': serviceObjectId
        },
        { $set: updateQuery },
        { new: true }
      )
      .populate('clientId')
      .exec();

    if (!updatedOffer) {
      throw new NotFoundException(`Offer price with ID ${offerId} or service with ID ${serviceId} not found`);
    }

    return updatedOffer;
  }

  async removeServiceFromOffer(
    offerId: string,
    serviceId: string,
  ): Promise<OfferPrices> {
    const offer = await this.offerPriceModel
      .findOne({ _id: offerId, isDeleted: false })
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer price with ID ${offerId} not found`);
    }

    // Use pull operator to remove the service
    const updatedOffer = await this.offerPriceModel
      .findOneAndUpdate(
        { _id: offerId, isDeleted: false },
        { $pull: { services: { _id: new Types.ObjectId(serviceId) } } },
        { new: true }
      )
      .populate('clientId')
      .exec();

    if (!updatedOffer) {
      throw new NotFoundException(`Service with ID ${serviceId} not found in offer`);
    }

    return updatedOffer;
  }

  async calculateTotalPrice(id: string): Promise<number> {
    const offer = await this.findOne(id);
    return offer.services.reduce((total, service) => total + (service.servicePrice || 0), 0);
  }

  // Convert an offer price into an official Order and create a linked WorkOrder
  async convertOfferToOrder(offerId: string, dto: ConvertOfferToOrderDto, userId?: string) {
    
    const offer = await this.offerPriceModel.findOne({ _id: offerId, isDeleted: false }).exec();
    if (!offer) throw new NotFoundException(`Offer price with ID ${offerId} not found`);

    // Validate required carModel
    if (!dto.carModel || dto.carModel.trim() === '') {
      throw new BadRequestException('Car Model name is required');
    }

    // Normalize and validate carSize (accept case-insensitive 'small','medium','large')
    let normalizedCarSize: string | undefined = undefined;
    if (dto.carSize) {
      const candidate = String(dto.carSize).toLowerCase();
      const allowed = Object.values(CarSize) as string[];
      if (!allowed.includes(candidate)) {
        throw new BadRequestException(`Invalid carSize. Allowed values: ${allowed.join(', ')}`);
      }
      normalizedCarSize = candidate;
    }

    // Build order DTO expected by Orders service
    const createOrderDto: any = {
      carModel: dto.carModel,
      carColor: dto.carColor,
      carPlateNumber: dto.carPlateNumber,
      carManufacturer: dto.carManufacturer,
      carSize: normalizedCarSize,
      services: offer.services.map((s) => ({
        serviceType: s.serviceType,
        dealDetails: s.dealDetails,
        protectionColor: s.protectionColor,
        protectionFinish: s.protectionFinish,
        protectionSize: s.protectionSize,
        protectionCoverage: s.protectionCoverage,
        insulatorType: s.insulatorType,
        insulatorCoverage: s.insulatorCoverage,
        insulatorPercentage: s.insulatorPercentage,
        polishType: s.polishType,
        polishSubType: s.polishSubType,
        additionType: s.additionType,
        washScope: s.washScope,
        servicePrice: s.servicePrice,
        serviceDate: s.serviceDate,
        guarantee: s.guarantee,
      })),
      notes: dto.notes || '',
      invoiceNotes: dto.invoiceNotes || '',
      assignedToEmployee1: dto.assignedToEmployee1,
      assignedToEmployee2: dto.assignedToEmployee2,
      assignedToEmployee3: dto.assignedToEmployee3,
    };

    // Create order via Orders service
    const orderCreated = await this.ordersService.createOrderForExistingClient(offer.client.toString(), createOrderDto as any);

    // create work order and link it
    const workOrder = await this.workOrderService.create({
      orderId: orderCreated.order._id as Types.ObjectId,
      customerId: offer.client.toString(),
      assignedToEmployee1: dto.assignedToEmployee1,
      assignedToEmployee2: dto.assignedToEmployee2,
      assignedToEmployee3: dto.assignedToEmployee3,
      notes: dto.notes || '',
    } as any);

    // update offer with link to created order
    offer.orderId = orderCreated.order._id as Types.ObjectId;
    await offer.save();

  }
}