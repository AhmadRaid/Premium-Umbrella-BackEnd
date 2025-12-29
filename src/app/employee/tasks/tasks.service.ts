// src/tasks/tasks.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument, TaskStatus } from 'src/schemas/task.schema';
import { BranchesEmployeeService } from '../branches/branches.service';

@Injectable()
export class TasksEmployeeService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private branchService: BranchesEmployeeService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // التحقق من وجود الفرع
    const branch = await this.branchService.findOne(createTaskDto.branchId);
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const task = new this.taskModel({
      ...createTaskDto,
      branchId: new Types.ObjectId(createTaskDto.branchId),
    });

    return task.save();
  }

  async findForSpecificBranch(
    userBranch: string,
    status?: TaskStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    const matchStage: any = { isDeleted: false };

    // if (branchId) {
    //   matchStage.branchId = new Types.ObjectId(branchId);
    // }

    if (status) {
      matchStage.status = status;
    }

    const skip = (page - 1) * limit;

    // Build pipeline stages separately for better type inference
    const pipeline: PipelineStage[] = [];

    // Add match stage
    pipeline.push({ $match: matchStage });

    // Add lookup stages
    pipeline.push({
      $lookup: {
        from: 'branches',
        localField: 'branchId',
        foreignField: '_id',
        as: 'branch',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$branch',
        preserveNullAndEmptyArrays: true,
      },
    });

    // Add project stage
    pipeline.push({
      $project: {
        title: 1,
        description: 1,
        status: 1,
        priority: 1,
        startDate: 1,
        endDate: 1,
        completionDate: 1,
        isDeleted: 1,
        createdAt: 1,
        updatedAt: 1,
        branch: {
          _id: 1,
          name: 1,
          type: 1,
        },
      },
    });

    // Add sort and pagination
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Execute aggregation
    const tasks = await this.taskModel.aggregate(pipeline).exec();

    // Get total count
    const total = await this.taskModel.countDocuments(matchStage);

    return {
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      tasks,
    };
  }

  async findOne(id: string): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID');
    }

    const task = await this.taskModel
      .findOne({ _id: id, isDeleted: false })
      .populate('branch', 'name')
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async updateTask(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID');
    }

    const task = await this.taskModel.findOne({ _id: id, isDeleted: false });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // نسخ updateTaskDto لتعديله
    const taskUpdateData: any = { ...updateTaskDto };

    if (taskUpdateData.branchId) {
      taskUpdateData.branchId = new Types.ObjectId(taskUpdateData.branchId);
    }

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, taskUpdateData, { new: true })
      .populate('branch', 'name')
      .exec();

    return updatedTask;
  }

  async removeTask(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID');
    }

    const task = await this.taskModel.findOne({ _id: id, isDeleted: false });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Soft delete
    await this.taskModel.findByIdAndUpdate(id, { isDeleted: true });
  }

  async getBranchTasksStats(branchId: string) {
    if (!Types.ObjectId.isValid(branchId)) {
      throw new BadRequestException('Invalid branch ID');
    }

    const stats = await this.taskModel.aggregate([
      {
        $match: {
          branchId: new Types.ObjectId(branchId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$actualCost' },
        },
      },
    ]);

    const totalTasks = await this.taskModel.countDocuments({
      branchId: new Types.ObjectId(branchId),
      isDeleted: false,
    });

    const totalCost = await this.taskModel.aggregate([
      {
        $match: {
          branchId: new Types.ObjectId(branchId),
          isDeleted: false,
          actualCost: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$actualCost' },
        },
      },
    ]);

    return {
      totalTasks,
      totalCost: totalCost[0]?.total || 0,
      byStatus: stats,
    };
  }
}
