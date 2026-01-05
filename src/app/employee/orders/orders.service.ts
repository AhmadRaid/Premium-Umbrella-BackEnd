import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Orders, OrdersDocument } from 'src/schemas/orders.schema';
import { AddServicesToOrderDto, ServiceDto } from './dto/add-service.dto';
import { Client } from '@googlemaps/google-maps-services-js';
import { Invoice, InvoiceDocument } from 'src/schemas/invoice.schema';
import { ClientDocument } from 'src/schemas/client.schema';
import { CreateOrderForExistingClientDto } from './dto/add-order';
import { AddGuaranteeDto } from './dto/create-guarantee.dto';
import { OrderStatus } from 'src/common/enum/orderStatus.enum';
import { CarType, CarTypeDocument } from 'src/schemas/carTypes.schema';

@Injectable()
export class OrdersEmployeeService {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    @InjectModel(Orders.name)
    private readonly ordersModel: Model<OrdersDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(CarType.name)
    private readonly carTypeModel: Model<CarTypeDocument>,
  ) {}

  async createOrderForExistingClient(
    clientId: string,
    createOrderDto: any,
  ): Promise<{
    order: OrdersDocument;
    invoice?: InvoiceDocument;
  }> {
    try {
      this.validateCreateOrderDto(createOrderDto);

      const client = await this.findClientById(clientId);

      const order = await this.createOrder(client, createOrderDto);

      let invoice = null;
      if (order) {
        invoice = await this.createInvoice(client, order, createOrderDto);

        await this.ordersModel.findByIdAndUpdate(
          order._id,
          { $set: { invoiceId: invoice._id } },
          { new: true },
        );
      }

      return {
        order: order.toObject(),
        invoice: invoice?.toObject(),
      };
    } catch (error) {
      this.handleCreateOrderError(error);
    }
  }

  private validateCreateOrderDto(dto: any): void {
    // التحقق من وجود الخدمات
    if (!dto.services || dto.services.length === 0) {
      throw new BadRequestException('At least one service is required');
    }

    const requiredCarFields = [
      'carModel',
      'carColor',
      'carPlateNumber',
      'carManufacturer',
    ];

    const missingFields = requiredCarFields.filter((field) => !dto[field]);
    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Car information is required when adding services. Missing fields: ${missingFields.join(', ')}`,
      );
    }

    // التحقق من صحة كل خدمة
    dto.services.forEach((service) => {
      if (!service.serviceType) {
        throw new BadRequestException(
          'Service type is required for each service',
        );
      }

      // التحقق من تاريخ الضمان إذا كان موجوداً
      if (service.guarantee) {
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
      }
    });
  }

  private async findClientById(clientId: string): Promise<ClientDocument> {

    const client = await this.clientModel.findById(clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  private async createOrder(
    client: ClientDocument,
    createOrderDto: any,
  ): Promise<OrdersDocument> {

    console.log('111111111111111111111',createOrderDto);
    
    // 1. فحص هل نوع السيارة موجود مسبقاً في CarType
    // نستخدم carModel من الـ dto لمقارنتها بحقل name في CarType
    let carType = await this.carTypeModel.findOne({
      carModel: createOrderDto.carModel,
    });

    if (!carType) {
      // 2. إذا لم تكن موجودة، نقوم بإنشائها
      carType = await this.carTypeModel.create({
        carModel: createOrderDto.carModel,
        manufacturer: createOrderDto.carManufacturer,
        size: createOrderDto.carSize, // التأكد من تطابق الـ Enum
      });
      console.log(`New CarType created: ${carType.carModel}`);
    }

    // 3. تجهيز بيانات الطلب
    const preparedServices = this.prepareServices(createOrderDto.services);
    const orderData = await this.buildOrderData(
      client,
      createOrderDto,
      preparedServices,
    );

    // 4. إنشاء الطلب
    const createdOrder = await this.ordersModel.create(orderData);

    // 5. تحديث العميل بإضافة معرف الطلب
    await this.clientModel.findByIdAndUpdate(
      client._id,
      { $push: { orderIds: createdOrder._id } },
      { new: true },
    );

    return createdOrder;
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

  private calculateSubtotal(services: ServiceDto[]): number {
    return services.reduce((total, service) => total + service.servicePrice, 0);
  }

  private prepareServices(services: ServiceDto[]): any[] {
    if (!services) return [];

    return services.map((service) => {
      const guarantee = service?.guarantee;
      const preparedService: any = {
        serviceType: service.serviceType,
        dealDetails: service.dealDetails,
        servicePrice: service.servicePrice,
        guarantee: guarantee
          ? {
              typeGuarantee: guarantee.typeGuarantee,
              startDate: guarantee.startDate ? new Date(guarantee.startDate) : undefined,
              endDate: guarantee.endDate ? new Date(guarantee.endDate) : undefined,
              terms: guarantee.terms || '',
              notes: guarantee.notes || '',
              status: (guarantee as any)?.['status'] ?? 'inactive',
              accepted: typeof (guarantee as any)?.['accepted'] === 'boolean' ? (guarantee as any)['accepted'] : false,
            }
          : undefined,
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
        preparedService.insulatorPercentage = service.insulatorPercentage;
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
      carManufacturer: dto.carManufacturer,
      carSize: dto.carSize,
      services,
      status: OrderStatus.NEW_ORDER,
      notes: dto.notes || '',
    };
  }

  private handleCreateOrderError(error: any): never {
    console.error('Error in createOrderForExistingClient:', error);

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
      error instanceof NotFoundException
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

    throw new InternalServerErrorException(
      error.message || 'An unexpected error occurred while creating order',
    );
  }

  async findAll(): Promise<Orders[]> {
    return this.ordersModel
      .aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: 'clients',
            localField: 'clientId',
            foreignField: '_id',
            as: 'client',
          },
        },
        {
          $unwind: {
            path: '$client',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ])
      .exec();
  }

  async findOne(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID');
    }

    const [result] = await this.ordersModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
          isDeleted: false,
        },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client',
        },
      },
      {
        $unwind: {
          path: '$client',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoiceId',
          foreignField: '_id',
          as: 'invoice',
        },
      },
      {
        $unwind: {
          path: '$invoice',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          // استبدال clientId ببيانات العميل الكاملة
          clientId: '$client',
          invoiceId: '$invoice',
          // إضافة الحقول المطلوبة في المستوى الرئيسي
          clientName: {
            $concat: [
              '$client.firstName',
              ' ',
              '$client.secondName',
              ' ',
              '$client.thirdName',
              ' ',
              '$client.lastName',
            ],
          },
          clientNumber: '$client.clientNumber',
        },
      },
    ]);

    if (!result) {
      throw new NotFoundException('Order not found');
    }

    return result;
  }

  async update(id: string, updateOrderDto: any): Promise<Orders> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID');
    }

    const updatedOrder = await this.ordersModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: updateOrderDto },
      { new: true },
    );

    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }

    return updatedOrder;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID');
    }

    const result = await this.ordersModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isDeleted: true },
      { new: true },
    );

    if (!result) {
      throw new NotFoundException('Order not found');
    }

    return { message: 'Order deleted successfully' };
  }

  async findByClient(clientId: string): Promise<Orders[]> {
    return this.ordersModel.find({
      clientId: new Types.ObjectId(clientId),
      isDeleted: false,
    });
  }

  async findActiveGuarantees(): Promise<Orders[]> {
    const today = new Date();
    return this.ordersModel.find({
      'guarantee.endDate': { $gte: today },
      isDeleted: false,
    });
  }

  async manuallyUpdateGuaranteeStatus(
    orderId: string,
    serviceId: string,
    guaranteeId: string,
    newStatus: 'active' | 'inactive',
  ): Promise<OrdersDocument> {
    try {
      // Validate IDs
      if (
        !Types.ObjectId.isValid(orderId) ||
        !Types.ObjectId.isValid(serviceId) ||
        !Types.ObjectId.isValid(guaranteeId)
      ) {
        throw new BadRequestException('Invalid IDs');
      }

      // Validate status
      if (newStatus !== 'active' && newStatus !== 'inactive') {
        throw new BadRequestException(
          'Status must be either "active" or "inactive"',
        );
      }

      // Update using both service and guarantee IDs
      const updatedOrder = await this.ordersModel.findOneAndUpdate(
        {
          _id: orderId,
          'services._id': new Types.ObjectId(serviceId),
          'services.guarantee._id': new Types.ObjectId(guaranteeId),
        },
        {
          $set: {
            'services.$.guarantee.status': newStatus,
            'services.$.guarantee.accepted': true,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedOrder) {
        throw new NotFoundException('Order, service, or guarantee not found');
      }

      return updatedOrder;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update guarantee status');
    }
  }

  async addGuaranteeToOrder(
    orderId: string,
    guaranteeData: AddGuaranteeDto,
  ): Promise<Orders> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate the dates
    if (guaranteeData.endDate <= guaranteeData.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (guaranteeData.startDate < today) {
      throw new BadRequestException(
        'Start date must be today or in the future',
      );
    }

    if (guaranteeData.endDate < today) {
      throw new BadRequestException('End date must be in the future');
    }

    const order = await this.ordersModel.findOne({
      _id: orderId,
      isDeleted: false,
    });
    if (!order) {
      throw new BadRequestException('Order not found or has been deleted');
    }

    const newGuarantee = {
      ...guaranteeData,
      status: 'active',
    };

    const updatedOrder = await this.ordersModel.findByIdAndUpdate(
      orderId,
      {
        $push: { guarantee: newGuarantee },
      },
      { new: true },
    );

    return updatedOrder;
  }

  async findUnacceptedGuaranteesAwaitingApproval(): Promise<Orders[]> {
    return this.ordersModel
      .aggregate([
        {
          $match: {
            isDeleted: false,
            services: {
              $elemMatch: {
                'guarantee.sendApproveForAdmin': true,
                'guarantee.accepted': false,
              },
            },
          },
        },
        {
          $lookup: {
            from: 'clients',
            localField: 'clientId',
            foreignField: '_id',
            as: 'client',
          },
        },
        {
          $unwind: {
            path: '$client',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ])
      .exec();
  }

  async updateGuaranteeAcceptance(
    orderId: string,
    serviceId: string,
    guaranteeId: string,
    accepted: boolean,
  ) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid Order ID');
    }
    if (!Types.ObjectId.isValid(guaranteeId)) {
      throw new BadRequestException('Invalid Guarantee ID');
    }

    const result = await this.ordersModel.findOneAndUpdate(
      {
        _id: orderId,
        'services._id': new Types.ObjectId(serviceId),
        'services.guarantee._id': new Types.ObjectId(guaranteeId),
      },
      {
        $set: {
          'services.$.guarantee.accepted': accepted,
          'services.$.guarantee.status': accepted ? 'active' : 'inactive',
        },
      },
      { new: true, runValidators: true },
    );

    if (!result) {
      throw new NotFoundException(
        'Order or guarantee not found. Either the order does not exist or the guarantee ID is incorrect.',
      );
    }

    return result;
  }

  async sendApproveGuaranteeRequest(
    orderId: string,
    serviceId: string,
    guaranteeId: string,
  ) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid Order ID');
    }
    if (!Types.ObjectId.isValid(guaranteeId)) {
      throw new BadRequestException('Invalid Guarantee ID');
    }

    const result = await this.ordersModel.findOneAndUpdate(
      {
        _id: orderId,
        'services._id': new Types.ObjectId(serviceId),
        'services.guarantee._id': guaranteeId,
      },
      {
        $set: {
          'services.$.guarantee.sendApproveForAdmin': true,
        },
      },
      { new: true, runValidators: true },
    );

    if (!result) {
      throw new NotFoundException(
        'Order or guarantee not found. Either the order does not exist or the guarantee ID is incorrect.',
      );
    }

    return result;
  }

  async addServicesToOrderByParam(orderId: string, services: ServiceDto[]) {
    return this.addServicesAsNewOrder(orderId, services);
  }

  async addServicesAsNewOrder(orderId: string, services: ServiceDto[]) {
    try {
      // Validate order ID
      if (!Types.ObjectId.isValid(orderId)) {
        throw new BadRequestException('Invalid order ID format');
      }

      // Find the original order
      const originalOrder = (await this.ordersModel.findById(
        orderId,
      )) as OrdersDocument;
      if (!originalOrder) {
        throw new NotFoundException('Order not found');
      }

      if (!Array.isArray(services) || services.length === 0) {
        throw new BadRequestException('At least one service is required');
      }

      // Prepare all services for the new order
      const newServices = services.map((serviceDto) => {
        const service: any = {
          _id: new Types.ObjectId(),
          serviceType: serviceDto.serviceType,
          dealDetails: serviceDto.dealDetails,
          servicePrice: serviceDto.servicePrice,
        };

        // Skip guarantee entirely for polish services
        if (serviceDto.serviceType !== 'تلميع' && serviceDto.guarantee) {
          service.guarantee = {
            typeGuarantee: serviceDto.guarantee.typeGuarantee,
            startDate: new Date(serviceDto.guarantee.startDate),
            endDate: new Date(serviceDto.guarantee.endDate),
            terms: serviceDto.guarantee.terms,
            notes:
              (serviceDto.guarantee as any).Notes || serviceDto.guarantee.notes,
            status: 'inactive',
            accepted: false,
          };
        }

        switch (serviceDto.serviceType) {
          case 'حماية':
            service.protectionFinish = serviceDto.protectionFinish;
            service.protectionSize = serviceDto.protectionSize;
            service.protectionCoverage = serviceDto.protectionCoverage;
            service.originalCarColor = serviceDto.originalCarColor;
            service.protectionColor = serviceDto.protectionColor;
            break;
          case 'عازل حراري':
            service.insulatorType = serviceDto.insulatorType;
            service.insulatorCoverage = serviceDto.insulatorCoverage;
            service.insulatorPercentage = serviceDto.insulatorPercentage;
            break;
          case 'تلميع':
            service.polishType = serviceDto.polishType;
            service.polishSubType = serviceDto.polishSubType;
            break;
          case 'إضافات':
            service.additionType = serviceDto.additionType;
            service.washScope = serviceDto.washScope;
            break;
        }

        return service;
      });

      // Create a new order copying car and client data from original order
      const newOrderData: any = {
        clientId: originalOrder.clientId,
        carModel: originalOrder.carModel,
        carColor: originalOrder.carColor,
        carPlateNumber: originalOrder.carPlateNumber,
        carManufacturer: originalOrder.carManufacturer,
        carSize: originalOrder.carSize,
        status: OrderStatus.NEW_ORDER,
        notes: originalOrder.notes,
        services: newServices,
      };

      const createdOrder = await this.ordersModel.create(newOrderData);

      // Link new order to client
      await this.clientModel.findByIdAndUpdate(
        createdOrder.clientId,
        { $push: { orderIds: createdOrder._id } },
        { new: true },
      );

      const subtotal = this.calculateSubtotal(newServices);
      const taxRate = 5;
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      const invoice = await this.invoiceModel.create({
        clientId: createdOrder.clientId as any,
        orderId: createdOrder._id as any,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        discount: 0,
        finalAmount: totalAmount,
        notes: '',
      });

      await this.ordersModel.findByIdAndUpdate(
        createdOrder._id,
        { $set: { invoiceId: invoice._id } },
        { new: true },
      );

      return {
        success: true,
        message: `New order created with ${newServices.length} service(s)`,
        order: createdOrder.toObject(),
        invoice: invoice.toObject(),
      };
    } catch (error) {
      console.error('Error adding services by param:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new BadRequestException(
          `Validation failed: ${errorMessages.join(', ')}`,
        );
      }
      throw new BadRequestException(
        error.message || 'Failed to add services to order',
      );
    }
  }

  async changeStatus(orderId: string, changeStatusDto: any): Promise<Orders> {
    const order = await this.ordersModel.findById(orderId).exec();

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = changeStatusDto.status;

    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: changeStatusDto.status,
      changedAt: new Date(),
      changedBy: changeStatusDto.changedBy,
    });

    return order.save();
  }

  async getStatusHistory(id: string): Promise<any> {
    const order = await this.ordersModel.findById(id).exec();

    if (!order) {
      throw new Error('Order not found');
    }

    return order.statusHistory || [];
  }

  async findByStatus(status: any): Promise<Orders[]> {
    return this.ordersModel.find({ status, isDeleted: false }).exec();
  }

  async getOrderWithClientDetails(id: string): Promise<any> {
    return this.ordersModel
      .findById(id)
      .populate('clientId', 'name phone secondPhone email')
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .exec();
  }
}
