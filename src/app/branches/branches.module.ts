import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Branch, BranchSchema } from 'src/schemas/branch.schema';

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: Branch.name, schema: BranchSchema },
      ]),
    ],
  controllers: [BranchesController],
  providers: [BranchesService],
    exports: [BranchesService],
  
})
export class BranchesModule {}
