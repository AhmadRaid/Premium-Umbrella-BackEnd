import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service } from 'src/schemas/service.schema';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { ServiceDto } from '../client/dto/service.dto';
import { Client, ClientDocument } from 'src/schemas/client.schema';
import { Orders, OrdersDocument } from 'src/schemas/orders.schema';
import { Invoice, InvoiceDocument } from 'src/schemas/invoice.schema';
import { CreateOrderForExistingClientDto } from '../orders/dto/add-order';
import { OrderStatus } from 'src/common/enum/orderStatus.enum';

@Injectable()
export class ServicesEmployeeService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    @InjectModel(Orders.name)
    private readonly ordersModel: Model<OrdersDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      const createdService = new this.serviceModel(createServiceDto);
      return await createdService.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Service name already exists');
      }
      throw new BadRequestException('Failed to create service');
    }
  }

  async findAll(): Promise<Service[]> {
    return this.serviceModel.find({ isDeleted: false }).exec();
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .exec();

    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    try {
      const updatedService = await this.serviceModel
        .findByIdAndUpdate(id, updateServiceDto, { new: true })
        .exec();

      if (!updatedService) {
        throw new NotFoundException('Service not found');
      }
      return updatedService;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Service name already exists');
      }
      throw new BadRequestException('Failed to update service');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.serviceModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException('Service not found');
    }
    return { message: 'Service deleted successfully' };
  }

  // تحسين الدالة الرئيسية في service.service.ts
  // async addServiceToOrder(orderId: string, serviceRequest: any) {
  //   try {
  //     const originalOrder = await this.findOriginalOrder(orderId);

  //     // استخراج وتنظيف بيانات الخدمة
  //     const serviceDto = this.extractAndCleanService(serviceRequest);

  //     // إنشاء طلب جديد
  //     const newOrder = await this.createNewOrder(originalOrder, serviceDto);

  //     // تحديث العميل
  //      await this.updateClientWithNewOrder(originalOrder.clientId, new Types.ObjectId(newOrder._id as string));

  //     // إنشاء الفاتورة
  //     const invoice = await this.createInvoiceForOrder(
  //       originalOrder.clientId,
  //       newOrder,
  //       serviceDto,
  //     );

  //     return newOrder;
  //   } catch (error) {
  //     this.handleCreateOrderError(error);
  //   }
  // }

  // دالة مساعدة للبحث عن الطلب الأصلي
  private async findOriginalOrder(orderId: string): Promise<OrdersDocument> {
    const order = await this.ordersModel
      .findById(orderId)
      .populate('clientId')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private extractAndCleanService(serviceRequest: any): ServiceDto {
    if (
      !serviceRequest.services ||
      !Array.isArray(serviceRequest.services) ||
      serviceRequest.services.length === 0
    ) {
      throw new BadRequestException('At least one service is required');
    }

    const serviceData = serviceRequest.services[0];

    // إنشاء كائن جديد بدون الحقول غير المرغوب فيها
    const cleanedService: ServiceDto = {
      serviceType: serviceData.serviceType,
      dealDetails: serviceData.dealDetails,
      servicePrice: serviceData.servicePrice,
      guarantee: {
        typeGuarantee: serviceData.guarantee.typeGuarantee,
        startDate: serviceData.guarantee.startDate,
        endDate: serviceData.guarantee.endDate,
        terms: serviceData.guarantee.terms,
        notes:
          (serviceData.guarantee as any).Notes || serviceData.guarantee.notes,
      },
    };

    // إضافة الحقول الخاصة بكل نوع خدمة
    this.addServiceSpecificFieldsToCleanedService(cleanedService, serviceData);

    return cleanedService;
  }

  // دالة مساعدة لإضافة الحقول الخاصة بالخدمة
  private addServiceSpecificFieldsToCleanedService(
    cleanedService: ServiceDto,
    originalService: any,
  ): void {
    switch (originalService.serviceType) {
      case 'حماية':
        cleanedService.protectionFinish = originalService.protectionFinish;
        cleanedService.protectionSize = originalService.protectionSize;
        cleanedService.protectionCoverage = originalService.protectionCoverage;
        cleanedService.originalCarColor = originalService.originalCarColor;
        cleanedService.protectionColor = originalService.protectionColor;
        break;

      case 'عازل حراري':
        cleanedService.insulatorType = originalService.insulatorType;
        cleanedService.insulatorCoverage = originalService.insulatorCoverage;
        break;

      case 'تلميع':
        cleanedService.polishType = originalService.polishType;
        cleanedService.polishSubType = originalService.polishSubType;
        break;

      case 'إضافات':
        cleanedService.additionType = originalService.additionType;
        cleanedService.washScope = originalService.washScope;
        break;
    }
  }

  // // دالة مساعدة لإنشاء طلب جديد
  // private async createNewOrder(
  //   originalOrder: OrdersDocument,
  //   serviceDto: ServiceDto,
  // ): Promise<OrdersDocument> {
  //   console.log('33333333333333',serviceDto);
    
  //   const originalOrderObj = originalOrder.toObject();

  //   const newOrderData = {
  //     clientId: originalOrderObj.clientId,
  //     carModel: originalOrderObj.carModel,
  //     carColor: originalOrderObj.carColor,
  //     carPlateNumber: originalOrderObj.carPlateNumber,
  //     carSize: originalOrderObj.carSize,
  //     notes: originalOrderObj.notes || '',
  //     services: [serviceDto],
  //     status: OrderStatus.NEW_ORDER,
  //   };

  //   this.validateCreateOrderDto(newOrderData);

  //   return await this.ordersModel.create(newOrderData);
  // }

  // // دالة مساعدة لتحديث العميل
  // private async updateClientWithNewOrder(
  //   clientId: Types.ObjectId,
  //   orderId: Types.ObjectId,
  // ): Promise<void> {
  //   await this.clientModel.findByIdAndUpdate(
  //     clientId,
  //     { $push: { orderIds: orderId } },
  //     { new: true },
  //   );
  // }

  // دالة مساعدة لإنشاء الفاتورة
  private async createInvoiceForOrder(
    clientId: Types.ObjectId,
    order: OrdersDocument,
    serviceDto: ServiceDto,
  ): Promise<InvoiceDocument | null> {
    try {
      const invoice = await this.invoiceModel.create({
        clientId: clientId,
        orderId: order._id,
        subtotal: serviceDto.servicePrice || 0,
        taxRate: 5,
        taxAmount: (serviceDto.servicePrice || 0) * 0.15,
        totalAmount: (serviceDto.servicePrice || 0) * 1.05,
        discount: 0,
        finalAmount: (serviceDto.servicePrice || 0) * 1.05,
        notes: '',
      });

      await this.ordersModel.findByIdAndUpdate(
        order._id,
        { $set: { invoiceId: invoice._id } },
        { new: true },
      );

      return invoice;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      return null;
    }
  }

  // دالة مساعدة لبناء الاستجابة
  private buildResponse(
    order: OrdersDocument,
    invoice: InvoiceDocument | null,
  ) {
    return {
      success: true,
      message: 'Service added successfully and new order created',
      data: {
        order: order.toObject(),
        invoice: invoice ? invoice.toObject() : null,
      },
    };
  }

  private handleCreateOrderError(error: any): never {
    console.error('Error in addServiceToOrder:', error);

    if (error.code === 11000) {
      throw new ConflictException('Duplicate order data detected');
    }

    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      throw new BadRequestException(
        `Validation failed: ${errorMessages.join(', ')}`,
      );
    }

    if (error.name === 'CastError') {
      throw new BadRequestException(
        `Invalid data type for field: ${error.path}`,
      );
    }

    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    if (
      error.message?.includes('invalid date') ||
      error.message?.includes('date format')
    ) {
      throw new BadRequestException(
        'Invalid date format. Please use YYYY-MM-DD format',
      );
    }

    // معالجة الخطأ الجديد
    if (error.message?.includes('forEach is not a function')) {
      throw new BadRequestException(
        'Invalid services format. Services should be an array',
      );
    }

    throw new InternalServerErrorException(
      error.message || 'An unexpected error occurred while creating order',
    );
  }

  private validateCreateOrderDto(orderData: any): void {
    // التحقق من وجود الخدمات
    if (
      !orderData.services ||
      !Array.isArray(orderData.services) ||
      orderData.services.length === 0
    ) {
      throw new BadRequestException('At least one service is required');
    }

    const requiredCarFields = [
      'carModel',
      'carColor',
      'carPlateNumber',
    ];

    const missingFields = requiredCarFields.filter(
      (field) => !orderData[field],
    );
    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Car information is required when adding services. Missing fields: ${missingFields.join(', ')}`,
      );
    }

    // التحقق من صحة كل خدمة
    orderData.services.forEach((service: any) => {
      if (!service.serviceType) {
        throw new BadRequestException(
          'Service type is required for each service',
        );
      }

      // التحقق من وجود الضمان
      if (!service.guarantee) {
        throw new BadRequestException(
          'Guarantee information is required for each service',
        );
      }

      // التحقق من تاريخ الضمان
      const startDate = new Date(service.guarantee.startDate);
      const endDate = new Date(service.guarantee.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid guarantee date format');
      }

      if (startDate > endDate) {
        throw new BadRequestException(
          'Guarantee start date cannot be after end date',
        );
      }

      // التحقق من الحقول المطلوبة بناءً على نوع الخدمة
      this.validateServiceSpecificFields(service);
    });
  }

  // دالة مساعدة للتحقق من الحقول الخاصة بكل نوع خدمة
  private validateServiceSpecificFields(service: any): void {
    switch (service.serviceType) {
      case 'حماية':
        if (
          !service.protectionFinish ||
          !service.protectionSize ||
          !service.protectionCoverage
        ) {
          throw new BadRequestException(
            'Protection finish, size and coverage are required for protection services',
          );
        }
        break;

      case 'عازل حراري':
        if (!service.insulatorType || !service.insulatorCoverage) {
          throw new BadRequestException(
            'Insulator type and coverage are required for insulator services',
          );
        }
        break;

      case 'تلميع':
        if (!service.polishType) {
          throw new BadRequestException(
            'Polish type is required for polish services',
          );
        }
        break;

      case 'إضافات':
        if (!service.additionType) {
          throw new BadRequestException(
            'Addition type is required for addition services',
          );
        }
        break;
    }
  }

  private async findClientById(clientId: string): Promise<ClientDocument> {
    const client = await this.clientModel.findById(clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  private buildOrderData(
    client: ClientDocument,
    dto: CreateOrderForExistingClientDto,
    services: any[],
  ): any {
    return {
      clientId: client._id,
      carModel: dto.carModel,
      carColor: dto.carColor,
      carPlateNumber: dto.carPlateNumber,
      carSize: dto.carSize,
      services,
      status: OrderStatus.NEW_ORDER,
      notes: dto.notes || '',
    };
  }

  private async createOrder(
    client: ClientDocument,
    createOrderDto: any,
  ): Promise<OrdersDocument> {
    const preparedServices = this.prepareServices(createOrderDto.services);
    const orderData = await this.buildOrderData(
      client,
      createOrderDto,
      preparedServices,
    );

    const createdOrder = await this.ordersModel.create(orderData);

    // تحديث العميل بإضافة معرف الطلب
    await this.clientModel.findByIdAndUpdate(
      client._id,
      { $push: { orderIds: createdOrder._id } },
      { new: true },
    );

    return createdOrder;
  }

  private calculateSubtotal(services: ServiceDto[]): number {
    return services.reduce((total, service) => total + service.servicePrice, 0);
  }

  private async createInvoice(
    client: ClientDocument,
    order: OrdersDocument,
    createOrderDto: any,
  ): Promise<InvoiceDocument> {
    try {
      // حساب المبالغ المالية
      const subtotal = this.calculateSubtotal(createOrderDto.services);
      const taxRate = 5; // يمكن جعلها قابلة للتخصيص
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      // إنشاء الفاتورة
      const invoice = await this.invoiceModel.create({
        clientId: client._id,
        orderId: order._id,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        discount: 0,
        finalAmount: totalAmount - 0,
        notes: createOrderDto.invoiceNotes || '',
      });

      return invoice;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw new InternalServerErrorException('Failed to create invoice');
    }
  }

  private prepareServices(services: ServiceDto[]): any[] {
    if (!services) return [];

    return services.map((service) => {
      const preparedService: any = {
        serviceType: service.serviceType,
        dealDetails: service.dealDetails,
        servicePrice: service.servicePrice,
        guarantee: {
          typeGuarantee: service.guarantee.typeGuarantee,
          startDate: new Date(service.guarantee.startDate),
          endDate: new Date(service.guarantee.endDate),
          terms: service.guarantee.terms,
          notes: service.guarantee.notes,
          status: 'inactive',
          accepted: false,
        },
      };

      // إضافة حقول خاصة بالخدمة
      this.addServiceSpecificFields(preparedService, service);

      return preparedService;
    });
  }

  private addServiceSpecificFields(
    preparedService: any,
    service: ServiceDto,
  ): void {
    switch (service.serviceType) {
      case 'حماية':
        preparedService.protectionFinish = service.protectionFinish;
        preparedService.protectionSize = service.protectionSize;
        preparedService.protectionCoverage = service.protectionCoverage;
        preparedService.originalCarColor = service.originalCarColor;
        preparedService.protectionColor = service.protectionColor;
        break;

      case 'عازل حراري':
        preparedService.insulatorType = service.insulatorType;
        preparedService.insulatorCoverage = service.insulatorCoverage;
        break;

      case 'تلميع':
        preparedService.polishType = service.polishType;
        preparedService.polishSubType = service.polishSubType;
        break;

      case 'إضافات':
        preparedService.additionType = service.additionType;
        preparedService.washScope = service.washScope;
        break;
    }
  }
}
