import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOfferPriceDto } from './dto/create-offer-price.dto';
import { UpdateOfferPriceDto } from './dto/update-offer-price.dto';
import { AddServiceToOfferDto } from './dto/add-service-to-offer.dto';
import { OfferPrices, OfferPricesDocument } from 'src/schemas/offerPrice.schema';

@Injectable()
export class OfferPricesService {
  constructor(
    @InjectModel(OfferPrices.name)
    private offerPriceModel: Model<OfferPricesDocument>,
  ) {}

  async create(createOfferPriceDto: CreateOfferPriceDto): Promise<OfferPrices> {
    const createdOffer = new this.offerPriceModel(createOfferPriceDto);
    return createdOffer.save();
  }

  async findAll(): Promise<OfferPrices[]> {
    return this.offerPriceModel
      .find({ isDeleted: false })
      .populate('clientId')
      .exec();
  }

  async findOne(id: string): Promise<OfferPrices> {
    const offer = await this.offerPriceModel
      .findOne({ _id: id, isDeleted: false })
      .populate('clientId')
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
      .populate('clientId')
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
      .populate('clientId')
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
}