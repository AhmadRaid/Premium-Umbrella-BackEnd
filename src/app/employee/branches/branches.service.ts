// src/branches/branches.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBranchDto } from './dto/create-branch.dto';
import { Branch, BranchDocument } from 'src/schemas/branch.schema';

@Injectable()
export class BranchesEmployeeService {
  constructor(
    @InjectModel(Branch.name) private branchModel: Model<BranchDocument>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
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
}
