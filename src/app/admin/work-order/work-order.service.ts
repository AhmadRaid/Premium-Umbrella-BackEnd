import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkOrder, WorkOrderDocument } from 'src/schemas/workOrder.schema';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';

@Injectable()
export class WorkOrderService {
    constructor(
        @InjectModel(WorkOrder.name)
        private readonly workOrderModel: Model<WorkOrderDocument>,
    ) { }

    // Build a reusable aggregation pipeline to populate related documents and project safe fields
    private buildAggregatePipeline(match: any = {}) {
        return [
            { $match: match },

            // Populate order and client
            { $lookup: { from: 'orders', localField: 'order', foreignField: '_id', as: 'order' } },
            { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'clients', localField: 'client', foreignField: '_id', as: 'client' } },
            { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },

            // Look up assigned employees with safe projection
            {
                $lookup: {
                    from: 'users',
                    let: { assignedId: '$assignedToEmployee1' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$assignedId'] } } },
                        { $project: { password: 0, refreshToken: 0, tokens: 0 } },
                    ],
                    as: 'assignedToEmployee1',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { assignedId: '$assignedToEmployee2' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$assignedId'] } } },
                        { $project: { password: 0, refreshToken: 0, tokens: 0 } },
                    ],
                    as: 'assignedToEmployee2',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { assignedId: '$assignedToEmployee3' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$assignedId'] } } },
                        { $project: { password: 0, refreshToken: 0, tokens: 0 } },
                    ],
                    as: 'assignedToEmployee3',
                },
            },

            // Merge assigned arrays
            {
                $addFields: {
                    assignedEmployees: {
                        $concatArrays: ['$assignedToEmployee1', '$assignedToEmployee2', '$assignedToEmployee3'],
                    },
                },
            },

            // Final projection (include full client object)
            {
                $project: {
                    order: 1,
                    client: 1,
                    assignedEmployees: 1,
                    status: 1,
                    statusHistory: 1,
                    notes: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },

            { $sort: { createdAt: -1 } },
        ];
    }

    async create(dto: CreateWorkOrderDto): Promise<WorkOrderDocument> {
        // if (!Types.ObjectId.isValid(dto.orderId) || !Types.ObjectId.isValid(dto.clientId)) {
        //     throw new BadRequestException('Invalid order or client');
        // }

        const data: any = {
            order: new Types.ObjectId(dto.orderId),
            client: new Types.ObjectId(dto.clientId),
            notes: dto.notes || '',
        };

        if (dto.assignedToEmployee1) data.assignedToEmployee1 = new Types.ObjectId(dto.assignedToEmployee1);
        if (dto.assignedToEmployee2) data.assignedToEmployee2 = new Types.ObjectId(dto.assignedToEmployee2);
        if (dto.assignedToEmployee3) data.assignedToEmployee3 = new Types.ObjectId(dto.assignedToEmployee3);

        const created = await this.workOrderModel.create(data);
        // return populated document
        return this.findOne(created._id.toString());
    }

    async findAll(filter: any = {}): Promise<any[]> {
        // Accept optional filters (e.g., status, clientId) and build a $match object
        const match: any = { isDeleted: false };
        if (filter.status) match.status = filter.status;
        if (filter.clientId && Types.ObjectId.isValid(filter.clientId)) match.client = new Types.ObjectId(filter.clientId);

        const pipeline = this.buildAggregatePipeline(match);
        return this.workOrderModel.aggregate(pipeline as any).exec();
    }

    async findOne(workOrderId: string): Promise<any> {
        if (!Types.ObjectId.isValid(workOrderId)) throw new BadRequestException('Invalid ID');

        const pipeline = this.buildAggregatePipeline({ _id: new Types.ObjectId(workOrderId), isDeleted: false });
        const [result] = await this.workOrderModel.aggregate(pipeline as any).exec();

        if (!result) throw new NotFoundException('WorkOrder not found');
        return result;
    }

    async update(workOrderId: string, dto: any): Promise<WorkOrderDocument> {
        if (!Types.ObjectId.isValid(workOrderId)) throw new BadRequestException('Invalid ID');
        const update: any = { ...dto };
        ['assignedToEmployee1', 'assignedToEmployee2', 'assignedToEmployee3'].forEach((k) => {
            if (update[k]) {
                if (!Types.ObjectId.isValid(update[k])) throw new BadRequestException(`${k} is invalid`);
                update[k] = new Types.ObjectId(update[k]);
            }
        });

        const result = await this.workOrderModel.findByIdAndUpdate(workOrderId, { $set: update }, { new: true });
        if (!result) throw new NotFoundException('WorkOrder not found');
        return this.findOne(workOrderId);
    }

    async remove(workOrderId: string): Promise<{ message: string }> {
        if (!Types.ObjectId.isValid(workOrderId)) throw new BadRequestException('Invalid ID');
        const result = await this.workOrderModel.findByIdAndUpdate(workOrderId, { isDeleted: true }, { new: true });
        if (!result) throw new NotFoundException('WorkOrder not found');
        return { message: 'تم حدف امر عمل بنجاح' };
    }

    async assignEmployees(workOrderId: string, dto: { assignedToEmployee1?: string; assignedToEmployee2?: string; assignedToEmployee3?: string; }) {
        if (!Types.ObjectId.isValid(workOrderId)) throw new BadRequestException('Invalid ID');
        const update: any = {};

        if (dto.assignedToEmployee1) {
            if (!Types.ObjectId.isValid(dto.assignedToEmployee1)) throw new BadRequestException('Invalid assignedToEmployee1 ID');
            update.assignedToEmployee1 = new Types.ObjectId(dto.assignedToEmployee1);
        }
        if (dto.assignedToEmployee2) {
            if (!Types.ObjectId.isValid(dto.assignedToEmployee2)) throw new BadRequestException('Invalid assignedToEmployee2 ID');
            update.assignedToEmployee2 = new Types.ObjectId(dto.assignedToEmployee2);
        }
        if (dto.assignedToEmployee3) {
            if (!Types.ObjectId.isValid(dto.assignedToEmployee3)) throw new BadRequestException('Invalid assignedToEmployee3 ID');
            update.assignedToEmployee3 = new Types.ObjectId(dto.assignedToEmployee3);
        }

        if (Object.keys(update).length === 0) throw new BadRequestException('At least one employee ID is required');

        update.status = 'تم التخصيص';

        const result = await this.workOrderModel.findByIdAndUpdate(
            workOrderId,
            {
                $set: update,
                $push: {
                    statusHistory: {
                        status: 'تم التخصيص',
                        changedAt: new Date(),
                    },
                },
            },
            { new: true },
        );

        if (!result) throw new NotFoundException('WorkOrder not found');
        return this.findOne(workOrderId);
    }

    async findByAssignedEmployee(employeeId: string) {
        if (!Types.ObjectId.isValid(employeeId)) throw new BadRequestException('Invalid Employee ID');

        const match = {
            isDeleted: false,
            $or: [
                { assignedToEmployee1: new Types.ObjectId(employeeId) },
                { assignedToEmployee2: new Types.ObjectId(employeeId) },
                { assignedToEmployee3: new Types.ObjectId(employeeId) },
            ],
        };

        const pipeline = this.buildAggregatePipeline(match);
        return this.workOrderModel.aggregate(pipeline as any).exec();
    }
}
