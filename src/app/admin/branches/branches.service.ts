// src/branches/branches.service.ts
import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBranchDto } from './dto/create-branch.dto';
import { Branch, BranchDocument } from 'src/schemas/branch.schema';

@Injectable()
export class BranchesService {
  constructor(
    @InjectModel(Branch.name) private branchModel: Model<BranchDocument>,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    // التحقق من عدم وجود فرع بنفس الاسم
    const existingBranch = await this.branchModel.findOne({
      name: createBranchDto.name,
      isDeleted: false
    });

    if (existingBranch) {
      throw new ConflictException('Branch with this name already exists');
    }

    const branch = new this.branchModel(createBranchDto);
    return branch.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ) {
    const filter: any = { isDeleted: false };

    const skip = (page - 1) * limit;
    
    const branches = await this.branchModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.branchModel.countDocuments(filter);

    return {
         pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      branches,
    };
  }

  async findOne(id: string): Promise<Branch> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid branch ID');
    }

    const branch = await this.branchModel
      .findOne({ _id: id, isDeleted: false })
      .exec();

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async update(branchId: string, updateBranchDto: any): Promise<Branch> {
    if (!Types.ObjectId.isValid(branchId)) {
      throw new BadRequestException('Invalid branch ID');
    }

    // إذا تم تحديث الاسم، التحقق من عدم التكرار
    if (updateBranchDto.name) {
      const existingBranch = await this.branchModel.findOne({
        name: updateBranchDto.name,
        _id: { $ne: branchId },
        isDeleted: false
      });

      if (existingBranch) {
        throw new ConflictException('Branch with this name already exists');
      }
    }

    const updatedBranch = await this.branchModel
      .findByIdAndUpdate(branchId, updateBranchDto, { new: true })
      .exec();

    if (!updatedBranch) {
      throw new NotFoundException('Branch not found');
    }

    return updatedBranch;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid branch ID');
    }

    const branch = await this.branchModel.findOne({ _id: id, isDeleted: false });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // // التحقق من عدم وجود مهام مرتبطة بالفرع
    // const taskCount = await this.tasksModel.countDocuments({
    //   branchId: id,
    //   isDeleted: false
    // });

    // if (taskCount > 0) {
    //   throw new BadRequestException('Cannot delete branch with associated tasks');
    // }

    // Soft delete
    await this.branchModel.findByIdAndUpdate(id, { isDeleted: true });
  }

  async addExpense(branchId: string, amount: number): Promise<Branch> {
    if (!Types.ObjectId.isValid(branchId)) {
      throw new BadRequestException('Invalid branch ID');
    }

    if (amount <= 0) {
      throw new BadRequestException('Expense amount must be positive');
    }

    const branch = await this.branchModel.findOne({ _id: branchId, isDeleted: false });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // التحقق من أن المصروف لا يتجاوز الميزانية
    if (branch.budget > 0 && (branch.totalExpenses + amount) > branch.budget) {
      throw new BadRequestException('Expense exceeds branch budget');
    }

    const updatedBranch = await this.branchModel
      .findByIdAndUpdate(
        branchId,
        { $inc: { totalExpenses: amount } },
        { new: true }
      )
      .exec();

    return updatedBranch;
  }

  async getFinancialReport(branchId: string) {
    if (!Types.ObjectId.isValid(branchId)) {
      throw new BadRequestException('Invalid branch ID');
    }

    const branch = await this.branchModel
      .findOne({ _id: branchId, isDeleted: false })
      .select('name budget totalExpenses')
      .exec();

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const remainingBudget = branch.budget - branch.totalExpenses;
    const utilizationPercentage = branch.budget > 0 
      ? (branch.totalExpenses / branch.budget) * 100 
      : 0;

    return {
      branch: branch.name,
      budget: branch.budget,
      totalExpenses: branch.totalExpenses,
      remainingBudget,
      utilizationPercentage: Math.round(utilizationPercentage * 100) / 100
    };
  }
}