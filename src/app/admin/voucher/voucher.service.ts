import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto, ApproveVoucherDto, RejectVoucherDto } from './dto/update-voucher.dto';
import { Voucher, VoucherDocument } from 'src/schemas/voucher.schema';

@Injectable()
export class VoucherService {
    constructor(
        @InjectModel(Voucher.name) private voucherModel: Model<VoucherDocument>,
    ) { }

    // إنشاء سند جديد
    async create(createVoucherDto: CreateVoucherDto, userId: string): Promise<Voucher> {
        const voucherData = {
            ...createVoucherDto,
            createdBy: new Types.ObjectId(userId),
            status: 'DRAFT'
        };

        const createdVoucher = new this.voucherModel(voucherData);
        return await createdVoucher.save();
    }

    // الحصول على جميع السندات
    async findAll(branchId: string, voucherNumber?: string, type?: string): Promise<Voucher[]> {
        const query: any = {
            isDeleted: false
        };

        if (branchId) {
            query.branchId = new Types.ObjectId(branchId);
        }

        if (voucherNumber) {
            // partial, case-insensitive match for voucher number (e.g., "VOU-1004" or partial input)
            query.voucherNumber = { $regex: voucherNumber, $options: 'i' };
        }

        if (type === 'PAYMENT' || type === 'RECEIPT') {
            query.type = type;
        }

        return await this.voucherModel
            .find(query)
            .populate('clientId', 'firstName lastName phone')
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .exec();
    }

    // الحصول على سند محدد
    async findOne(voucherId: string, branchId: string): Promise<Voucher> {
        console.log();
        
        return await this.voucherModel
            .findOne({
                _id: new Types.ObjectId(voucherId),
                // branchId: new Types.ObjectId(branchId),
                isDeleted: false
            })
            .populate('clientId', 'firstName lastName phone email')
            .populate('createdBy', 'fullName')
            .exec();
    }

    // تحديث سند
    async update(id: string, updateVoucherDto: UpdateVoucherDto, branchId: string): Promise<Voucher> {
        return await this.voucherModel.findOneAndUpdate(
            {
                _id: id,
                branchId: new Types.ObjectId(branchId),
                isDeleted: false
            },
            updateVoucherDto,
            { new: true }
        );
    }

    // حذف سند (حذف منطقي)
    async remove(id: string, branchId: string): Promise<void> {
        await this.voucherModel.findOneAndUpdate(
            {
                _id: id,
                branchId: new Types.ObjectId(branchId),
                isDeleted: false
            },
            {
                isDeleted: true,
                deletedAt: new Date()
            }
        );
    }

    // اعتماد سند
    async approve(id: string, approveDto: ApproveVoucherDto, branchId: string): Promise<Voucher> {
        return await this.voucherModel.findOneAndUpdate(
            {
                _id: id,
                branchId: new Types.ObjectId(branchId),
                isDeleted: false
            },
            {
                status: 'APPROVED'
            },
            { new: true }
        );
    }

    // رفض سند
    async reject(id: string, rejectDto: RejectVoucherDto, branchId: string): Promise<Voucher> {
        return await this.voucherModel.findOneAndUpdate(
            {
                _id: id,
                branchId: new Types.ObjectId(branchId),
                isDeleted: false
            },
            {
                status: 'REJECTED'
            },
            { new: true }
        );
    }

    // إحصائيات بسيطة
    async getStatistics(branchId: string) {
        const payments = await this.voucherModel.find({
          //  branchId: new Types.ObjectId(branchId),
            type: 'PAYMENT',
            isDeleted: false,
        //    status: 'APPROVED'
        });

        const receipts = await this.voucherModel.find({
          //  branchId: new Types.ObjectId(branchId),
            type: 'RECEIPT',
            isDeleted: false,
        //    status: 'APPROVED'
        });

        const totalPayments = payments.reduce((sum, voucher) => sum + voucher.amount, 0);
        const totalReceipts = receipts.reduce((sum, voucher) => sum + voucher.amount, 0);

        return {
            totalPayments,
            totalReceipts,
            netCashFlow: totalReceipts - totalPayments,
            paymentsCount: payments.length,
            receiptsCount: receipts.length
        };
    }
}