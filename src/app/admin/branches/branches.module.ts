import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Branch, BranchSchema } from 'src/schemas/branch.schema';
import { BranchesEmployeeService } from 'src/app/employee/branches/branches.service';
import { BranchesEmployeeController } from 'src/app/employee/branches/branches.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Branch.name, schema: BranchSchema }]),
  ],
  controllers: [BranchesController, BranchesEmployeeController],
  providers: [BranchesService, BranchesEmployeeService],
  exports: [BranchesService,BranchesEmployeeService],
})
export class BranchesModule {}
