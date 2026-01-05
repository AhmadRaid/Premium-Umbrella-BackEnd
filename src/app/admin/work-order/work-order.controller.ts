import { Controller, Post, Get, Put, Delete, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { AssignEmployeesDto } from './dto/assign-employees.dto';
import { JwtAuthAdminGuard } from 'src/common/guards/jwtAuthAdminGuard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRoles } from 'src/common/enum/adminRoles.enum';

@Controller('admin/work-orders')
@UseGuards(JwtAuthAdminGuard)
export class WorkOrderController {
  constructor(private readonly service: WorkOrderService) {}

  @Post()
  async create(@Body() dto: CreateWorkOrderDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':workOrderId')
  async findOne(@Param('workOrderId') workOrderId: string) {
    return this.service.findOne(workOrderId);
  }

  @Put(':workOrderId')
  async update(@Param('workOrderId') workOrderId: string, @Body() dto: any) {
    return this.service.update(workOrderId, dto);
  }

  @Delete(':workOrderId')
  async remove(@Param('workOrderId') workOrderId: string) {
    return this.service.remove(workOrderId);
  }

  @Patch(':workOrderId/assign')
  @Roles(AdminRoles.ADMIN)
  async assignEmployees(@Param('workOrderId') workOrderId: string, @Body() dto: AssignEmployeesDto) {
    return this.service.assignEmployees(workOrderId, dto);
  }

  @Get('assigned/:employeeId')
  async findByAssignedEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByAssignedEmployee(employeeId);
  }
}
