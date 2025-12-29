// src/invoice/invoice.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, PipelineStage, Types } from 'mongoose';
import { ClientService } from '../client/client.service';
import { OrdersService } from '../orders/orders.service';
import { Invoice } from 'src/schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    private readonly clientService: ClientService,
    private readonly ordersService: OrdersService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    try {
      await this.validateClientAndOrder(
        createInvoiceDto.clientId,
        createInvoiceDto.orderId,
      );

      const createdInvoice = new this.invoiceModel({
        ...createInvoiceDto,
        taxRate: createInvoiceDto.taxRate || 15,
      });

      return await createdInvoice.save();
    } catch (error) {
      this.handleInvoiceError(error);
    }
  }

  async findAll(
   // user: User,
    query: {
      keyword?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    },
  ) {
    const { keyword, startDate, endDate, status } = query;

    const matchStage: any = {
      isDeleted: false,
    };

    // if (user.branchId) {
    //   matchStage.branchId = new Types.ObjectId(user.branchId);
    // }

    if (status) {
      matchStage.status = status;
    }

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        matchStage.createdAt.$lte = end;
      }
    }

    if (keyword) {
      // **التعديل المقترح يبدأ هنا**
      // تحقق إذا كانت الكلمة المفتاحية رقم (مثل 1001)
      if (!isNaN(parseInt(keyword))) {
        // إذا كان رقمًا، ابحث عن تطابق تام مع invoiceNumber
        matchStage.$or = [
          { invoiceNumber: `INV-${keyword}` },
          { notes: new RegExp(keyword, 'i') },
          { 'clientDetails.firstName': new RegExp(keyword, 'i') },
          { 'clientDetails.secondName': new RegExp(keyword, 'i') },
          { 'clientDetails.lastName': new RegExp(keyword, 'i') },
        ];
      } else {
        // إذا كان نصًا، استخدم البحث المرن (regex) على كل الحقول
        const regex = new RegExp(keyword, 'i');
        matchStage.$or = [
          { invoiceNumber: { $regex: regex } },
          { notes: { $regex: regex } },
          { 'clientDetails.firstName': { $regex: regex } },
          { 'clientDetails.secondName': { $regex: regex } },
          { 'clientDetails.lastName': { $regex: regex } },
        ];
      }
      // **التعديل المقترح ينتهي هنا**
    }

    const aggregationPipeline: PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'clientDetails',
        },
      },
      {
        $unwind: { path: '$clientDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'orderDetails',
        },
      },
      {
        $unwind: { path: '$orderDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    return this.invoiceModel.aggregate(aggregationPipeline).exec();
  }

  async findInvoiceByOrderId(orderId: string) {
    const [invoice] = await this.invoiceModel.aggregate([
      {
        $match: {
          orderId: new Types.ObjectId(orderId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client',
          pipeline: [
            {
              $project: {
                firstName: 1,
                secondName: 1,
                thirdName: 1,
                lastName: 1,
                clientNumber: 1,
                phone: 1,
                secondPhone: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order',
          pipeline: [
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
              $project: {
                orderNumber: 1,
                carModel: 1,
                carColor: 1,
                carPlateNumber: 1,
                carManufacturer: 1,
                carSize: 1,
                services: 1,
                createdAt: 1,
                invoiceId: 1,
                invoiceNumber: '$invoice.invoiceNumber',
              },
            },
          ],
        },
      },
      {
        $unwind: '$client',
      },
      {
        $unwind: '$order',
      },
      {
        $addFields: {
          'order.services': {
            $map: {
              input: '$order.services',
              as: 'service',
              in: {
                $mergeObjects: [
                  '$$service',
                  {
                    serviceTypeArabic: {
                      $switch: {
                        branches: [
                          {
                            case: {
                              $eq: ['$$service.serviceType', 'حماية'],
                            },
                            then: 'حماية',
                          },
                          {
                            case: { $eq: ['$$service.serviceType', 'تلميع'] },
                            then: 'تلميع',
                          },
                          {
                            case: {
                              $eq: ['$$service.serviceType', 'عازل حراري'],
                            },
                            then: 'عازل حراري',
                          },
                          {
                            case: {
                              $eq: ['$$service.serviceType', 'إضافات'],
                            },
                            then: 'إضافات',
                          },
                        ],
                        default: '$$service.serviceType',
                      },
                    },
                    guaranteePeriod: {
                      $arrayElemAt: [
                        {
                          $split: ['$$service.guarantee.typeGuarantee', ' '],
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
          formattedInvoiceDate: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$invoiceDate',
            },
          },
          formattedOrderDate: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$order.createdAt',
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          invoiceNumber: 1,
          invoiceDate: '$formattedInvoiceDate',
          subtotal: 1,
          taxRate: 1,
          taxAmount: 1,
          totalAmount: 1,
          notes: 1,
          client: 1,
          status: 1,
          createdAt: 1,
          order: {
            orderNumber: 1,
            carModel: 1,
            carColor: 1,
            carPlateNumber: 1,
            carSize: 1,
            services: 1,
            createdAt: 1,
            orderDate: '$formattedOrderDate',
            invoiceNumber: '$order.invoiceNumber',
            carManufacturer: 1,
          },
        },
      },
    ]);

    if (!invoice) {
      throw new NotFoundException('Invoice not found for this order');
    }

    invoice.order.services = invoice.order.services.map((service) => {
      return {
        ...service,
        guarantee: {
          ...service.guarantee,
          startDate: new Date(service.guarantee.startDate).toLocaleDateString(
            'en-US',
          ),
          endDate: new Date(service.guarantee.endDate).toLocaleDateString(
            'en-US',
          ),
        },
      };
    });

    return invoice;
  }

  async findOne(invoiceId: string) {
    const [invoice] = await this.invoiceModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(invoiceId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client',
          pipeline: [
            {
              $project: {
                firstName: 1,
                secondName: 1,
                thirdName: 1,
                lastName: 1,
                clientNumber: 1,
                phone: 1,
                secondPhone: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order',
        },
      },
      {
        $unwind: '$client',
      },
      {
        $unwind: '$order',
      },
      {
        $addFields: {
          formattedDate: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$invoiceDate',
            },
          },
        },
      },
      {
        $project: {
          invoiceNumber: 1,
          invoiceDate: '$formattedDate',
          subtotal: 1,
          taxRate: 1,
          taxAmount: 1,
          totalAmount: 1,
          notes: 1,
          client: 1,
          order: 1,
          status: 1,
        },
      },
    ]);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async findByOrder(orderId: string) {
    return this.invoiceModel
      .find({ orderId, isDeleted: false })
      .sort({ createdAt: -1 });
  }

  async findByClient(clientId: string) {
    return this.invoiceModel
      .find({ clientId, isDeleted: false })
      .sort({ createdAt: -1 });
  }

  async getFinancialReports(clientId: string) {
    try {
      const client = await this.clientService.findOne(clientId);
      if (!client) {
        throw new NotFoundException('Client not found');
      }

      const report = await this.invoiceModel
        .aggregate([
          {
            $match: {
              clientId: new Types.ObjectId(clientId),
              isDeleted: false,
            },
          },
          {
            $group: {
              _id: '$clientId',
              totalInvoices: { $sum: 1 },
              totalSubtotal: { $sum: '$subtotal' },
              totalTaxAmount: { $sum: '$taxAmount' },
              totalAmount: { $sum: '$totalAmount' },
              averageInvoiceAmount: { $avg: '$totalAmount' },
            },
          },
          {
            $lookup: {
              from: 'clients',
              localField: '_id',
              foreignField: '_id',
              as: 'clientInfo',
            },
          },
          {
            $unwind: '$clientInfo',
          },
          {
            $project: {
              _id: 0,
              client: {
                _id: '$clientInfo._id',
                firstName: '$clientInfo.firstName',
                secondName: '$clientInfo.secondName',
                thirdName: '$clientInfo.thirdName',
                lastName: '$clientInfo.lastName',
                clientNumber: '$clientInfo.clientNumber',
                phone: '$clientInfo.phone',
                secondPhone: '$clientInfo.secondPhone',
              },
              totalInvoices: 1,
              totalSubtotal: 1,
              totalTaxAmount: 1,
              totalAmount: 1,
              averageInvoiceAmount: 1,
            },
          },
        ])
        .exec();

      if (report.length === 0) {
        return {
          client: {
            _id: client._id,
            firstName: client.firstName,
            lastName: client.lastName,
            clientNumber: client.clientNumber,
            email: client.email,
            phone: client.phone,
          },
          totalInvoices: 0,
          totalSubtotal: 0,
          totalTaxAmount: 0,
          totalAmount: 0,
          averageInvoiceAmount: 0,
        };
      }

      return report[0];
    } catch (error) {
      this.handleInvoiceError(error);
    }
  }

  async update(id: string, updateInvoiceDto: any) {
    try {
      const invoice = await this.findOne(id);

      if (updateInvoiceDto.services) {
        updateInvoiceDto.subtotal = this.calculateSubtotal(
          updateInvoiceDto.services,
        );
        updateInvoiceDto.taxAmount =
          updateInvoiceDto.subtotal * ((updateInvoiceDto.taxRate || 15) / 100);
        updateInvoiceDto.totalAmount =
          updateInvoiceDto.subtotal + updateInvoiceDto.taxAmount;
      }

      Object.assign(invoice, updateInvoiceDto);

      return await invoice.save();
    } catch (error) {
      this.handleInvoiceError(error);
    }
  }

  async softDelete(id: string) {
    const invoice = await this.findOne(id);
    invoice.isDeleted = true;
    return await invoice.save();
  }

  async restore(id: string) {
    const invoice = await this.invoiceModel.findOne({ _id: id });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    invoice.isDeleted = false;
    return await invoice.save();
  }

  private async validateClientAndOrder(clientId: string, orderId: string) {
    const [client, order] = await Promise.all([
      this.clientService.findOne(clientId),
      this.ordersService.findOne(orderId),
    ]);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.clientId.toString() !== clientId) {
      throw new BadRequestException('Order does not belong to this client');
    }
  }

  private calculateSubtotal(
    services: Array<{ servicePrice: number; quantity?: number }>,
  ): number {
    return services.reduce(
      (total, service) =>
        total + service.servicePrice * (service.quantity || 1),
      0,
    );
  }

  private handleInvoiceError(error: any) {
    if (error.code === 11000) {
      throw new ConflictException('Invoice with this number already exists');
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
      throw new BadRequestException(`Invalid ID format`);
    }

    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new BadRequestException(error.message || 'An error occurred');
  }

  async updateInvoiceStatus(
    invoiceId: ObjectId,
    newStatus: string,
  ): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }

    const currentStatus = invoice.status;

    // const validTransitions = {
    //   open: ['pending'],
    //   pending: ['approved', 'rejected'],
    //   approved: [],
    //   rejected: [],
    // };

    // const allowedStatuses = validTransitions[currentStatus];
    // if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
    //   throw new BadRequestException(
    //     `Invalid status transition from '${currentStatus}' to '${newStatus}'.`,
    //   );
    // }

    invoice.status = newStatus;
    return invoice.save();
  }
}
