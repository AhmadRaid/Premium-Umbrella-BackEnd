import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto, ApproveVoucherDto, RejectVoucherDto } from './dto/update-voucher.dto';
import { AuthRequest } from 'src/interfaces/AuthRequest';
import { AuthCompositeGuard } from 'src/common/guards/AuthCompositeGuard';

@UseGuards(AuthCompositeGuard)
@Controller('vouchers')
export class VoucherController {
    constructor(private readonly voucherService: VoucherService) { }

    @Post()
    create(@Body() createVoucherDto: CreateVoucherDto, @Request() req: AuthRequest) {
        return this.voucherService.create(createVoucherDto, req.user._id);
    }

    @Get()
    findAll(@Request() req: AuthRequest) {
        return this.voucherService.findAll(req.user.branchId);
    }

    @Get('statistics')
    getStatistics(@Request() req: AuthRequest) {
        return this.voucherService.getStatistics(req.user.branchId);
    }

    @Get(':vouchersId')
    findOne(@Param('vouchersId') vouchersId: string, @Request() req: AuthRequest) {
        return this.voucherService.findOne(vouchersId, req.user.branchId);
    }

    @Patch(':vouchersId')
    update(@Param('vouchersId') vouchersId: string, @Body() updateVoucherDto: UpdateVoucherDto, @Request() req: AuthRequest) {
        return this.voucherService.update(vouchersId, updateVoucherDto, req.user.branchId);
    }

    @Delete(':vouchersId')
    remove(@Param('vouchersId') vouchersId: string, @Request() req: AuthRequest) {
        return this.voucherService.remove(vouchersId, req.user.branchId);
    }

    @Post(':vouchersId/approve')
    approve(@Param('vouchersId') vouchersId: string, @Body() approveDto: ApproveVoucherDto, @Request() req: AuthRequest) {
        return this.voucherService.approve(vouchersId, approveDto, req.user.branchId);
    }

    @Post(':vouchersId/reject')
    reject(@Param('vouchersId') vouchersId: string, @Body() rejectDto: RejectVoucherDto, @Request() req: AuthRequest) {
        return this.voucherService.reject(vouchersId, rejectDto, req.user.branchId);
    }
}