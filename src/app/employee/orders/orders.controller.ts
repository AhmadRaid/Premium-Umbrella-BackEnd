import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';
import { OrdersEmployeeService } from './orders.service';
import { AddGuaranteeDto } from './dto/create-guarantee.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRoles } from 'src/common/enum/adminRoles.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersEmployeeController {
  constructor(private readonly ordersService: OrdersEmployeeService) {}

  @Post('add-order/:clientId')
  async createOrderForExistingClient(
    @Param('clientId') clientId: string,
    @Body() orderData: any,
  ) {
    return this.ordersService.createOrderForExistingClient(clientId, orderData);
  }

  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get('pending-guarantees')
  @Roles(AdminRoles.ADMIN)
  async getPendingGuarantees() {
    try {
      return await this.ordersService.findUnacceptedGuaranteesAwaitingApproval();
    } catch (error) {
      throw error;
    }
  }

  @Post(':orderId/add-service')
  async addServiceToOrderByParam(
    @Param('orderId') orderId: string,
    @Body() body: { services: any[] },
  ) {
    return this.ordersService.addServicesToOrderByParam(orderId, body.services);
  }

  @Get(':orderId')
  async findOne(@Param('orderId') orderId: string) {
    const order = await this.ordersService.findOne(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  @Put(':orderId')
  async update(@Param('orderId') orderId: string, @Body() updateOrderDto: any) {
    return this.ordersService.update(orderId, updateOrderDto);
  }

  @Delete(':orderId')
  async remove(@Param('orderId') orderId: string) {
    return this.ordersService.remove(orderId);
  }

  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.ordersService.findByClient(clientId);
  }

  @Get('active-guarantees')
  async findActiveGuarantees() {
    return this.ordersService.findActiveGuarantees();
  }

  @Patch(':orderId/service/:serviceId/guarantee/:guaranteeId/status')
  @Roles(AdminRoles.ADMIN)
  async updateGuaranteeStatus(
    @Param('orderId') orderId: string,
    @Param('serviceId') serviceId: string,
    @Param('guaranteeId') guaranteeId: string,
    @Body('status') newStatus: 'active' | 'inactive',
  ) {
    return this.ordersService.manuallyUpdateGuaranteeStatus(
      orderId,
      serviceId,
      guaranteeId,
      newStatus,
    );
  }

  @Post(':orderId/guarantee')
  async addGuarantee(
    @Param('orderId') orderId: string,
    @Body() guaranteeData: AddGuaranteeDto,
  ) {
    return this.ordersService.addGuaranteeToOrder(orderId, guaranteeData);
  }

  @Patch(':orderId/guarantee/:serviceId/:guaranteeId/changeAcceptGuarantee')
  @Roles(AdminRoles.ADMIN)
  async acceptGuarantee(
    @Param('orderId') orderId: string,
    @Param('serviceId') serviceId: string,
    @Param('guaranteeId') guaranteeIndex: string,
    @Body('accepted') accepted: boolean,
  ) {
    return this.ordersService.updateGuaranteeAcceptance(
      orderId,
      serviceId,
      guaranteeIndex,
      accepted,
    );
  }

  @Patch(
    ':orderId/guarantee/:serviceId/:guaranteeId/sendApproveGuaranteeRequest',
  )
  async sendApproveGuaranteeRequest(
    @Param('orderId') orderId: string,
    @Param('serviceId') serviceId: string,
    @Param('guaranteeId') guaranteeIndex: string,
  ) {
    return this.ordersService.sendApproveGuaranteeRequest(
      orderId,
      serviceId,
      guaranteeIndex,
    );
  }

  @Post(':orderId/:orderId/service/:serviceId/guarantee/:guaranteeId/status')
  changeStatus(
    @Param('orderId') orderId: string,
    @Body() changeStatusDto: any,
  ) {
    return this.ordersService.changeStatus(orderId, changeStatusDto);
  }

  @Get(':orderId/status-history')
  getStatusHistory(@Param('orderId') orderId: string) {
    return this.ordersService.getStatusHistory(orderId);
  }

  @Get('by-status/:status')
  findByStatus(@Param('status') status: any) {
    return this.ordersService.findByStatus(status);
  }

  @Get(':orderId/details')
  getOrderWithClientDetails(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderWithClientDetails(orderId);
  }
}
