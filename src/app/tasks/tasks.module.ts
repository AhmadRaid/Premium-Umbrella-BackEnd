// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { BranchesService } from '../branches/branches.service';
import { Task, TaskSchema } from 'src/schemas/task.schema';
import { Branch, BranchSchema } from 'src/schemas/branch.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Branch.name, schema: BranchSchema },
    ]),
    UserModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, BranchesService],
  exports: [TasksService],
})
export class TasksModule {}