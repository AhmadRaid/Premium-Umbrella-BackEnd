// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { BranchesService } from '../branches/branches.service';
import { Task, TaskSchema } from 'src/schemas/task.schema';
import { Branch, BranchSchema } from 'src/schemas/branch.schema';
import { UserModule } from '../user/user.module';
import { TasksEmployeeController } from 'src/app/employee/tasks/tasks.controller';
import { TasksEmployeeService } from 'src/app/employee/tasks/tasks.service';
import { BranchesModule } from '../branches/branches.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Branch.name, schema: BranchSchema },
    ]),
    UserModule,
    BranchesModule
  ],
  controllers: [TasksController, TasksEmployeeController],
  providers: [TasksService, BranchesService, TasksEmployeeService],
  exports: [TasksService],
})
export class TasksModule {}
