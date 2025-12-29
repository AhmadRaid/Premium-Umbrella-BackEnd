// src/invoice/invoice.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { ObjectId } from 'mongoose';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';
import { User } from 'src/schemas/user.schema';
import { UpdateStatusDto } from './dto/updateStatus.dto';
import { JwtAuthAdminGuard } from 'src/common/guards/jwtAuthAdminGuard';


@Controller('admin/invoices')
@UseGuards(JwtAuthAdminGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Get()
  async findAll(
  //  @Request() req,
    @Query()
    query: {
      keyword?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    },
  ) {
   //  const user: User = req.user
   // return this.invoiceService.findAll(user,query);
    return this.invoiceService.findAll(query);
  }

  @Get('order/:orderId')
  async findInvoiceByOrderId(@Param('orderId') orderId: string) {
    return this.invoiceService.findInvoiceByOrderId(orderId);
  }

  @Get(':invoiceId')
  async findOne(@Param('invoiceId') invoiceId: string) {
    return this.invoiceService.findOne(invoiceId);
  }

  @Get('by-order/:orderId')
  async findByOrder(@Param('orderId') orderId: string) {
    return this.invoiceService.findByOrder(orderId);
  }

  @Get('by-client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.invoiceService.findByClient(clientId);
  }

  // New endpoint for financial reports
  @Get('financial-reports/:clientId')
  async getFinancialReports(@Param('clientId') clientId: string) {
    return this.invoiceService.getFinancialReports(clientId);
  }

  @Patch(':invoiceId')
  async update(
    @Param('invoiceId') invoiceId: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.update(invoiceId, updateInvoiceDto);
  }

  @Delete(':invoiceId')
  async remove(@Param('invoiceId') invoiceId: string) {
    return this.invoiceService.softDelete(invoiceId);
  }

  @Post(':invoiceId/restore')
  async restore(@Param('invoiceId') invoiceId: string) {
    return this.invoiceService.restore(invoiceId);
  }

  @Patch(':invoiceId/status')
  async updateStatus(
    @Param('invoiceId') invoiceId: ObjectId,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.invoiceService.updateInvoiceStatus(
      invoiceId,
      updateStatusDto.status,
    );
  }
}
