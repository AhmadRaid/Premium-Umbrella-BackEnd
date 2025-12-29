// src/branches/branches.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';
import { JwtAuthAdminGuard } from 'src/common/guards/jwtAuthAdminGuard';

@Controller('admin/branches')
@UseGuards(JwtAuthAdminGuard)

export class BranchesController {
  constructor(private readonly branchService: BranchesService) {}

  @Post()
  // @UseGuards(RolesGuard)
  // @Roles(AdminRoles.ADMIN)
  async create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  // @UseGuards(RolesGuard)
  // @Roles(AdminRoles.ADMIN)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.branchService.findAll(page, limit);
  }

  @Get(':branchId')
  async findOne(@Param('branchId') id: string) {
    return this.branchService.findOne(id);
  }

  @Put(':branchId')
  // @Roles(UserRole.ADMIN)
  async update(@Param('branchId') id: string, @Body() updateBranchDto: any) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':branchId')
  //  @Roles(UserRole.ADMIN)
  async remove(@Param('branchId') id: string) {
    return this.branchService.remove(id);
  }

  @Get('financial-report/:branchId')
  //  @Role(UserRole.ADMIN, UserRole.MANAGER)
  async getFinancialReport(@Param('branchId') id: string) {
    return this.branchService.getFinancialReport(id);
  }
}
