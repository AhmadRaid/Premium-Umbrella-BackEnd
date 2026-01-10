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

    @Get(':voucherId')
    findOne(@Param('voucherId') voucherId: string, @Request() req: AuthRequest) {
        return this.voucherService.findOne(voucherId, req.user.branchId);
    }

    @Patch(':voucherId')
    update(@Param('voucherId') voucherId: string, @Body() updateVoucherDto: UpdateVoucherDto, @Request() req: AuthRequest) {
        return this.voucherService.update(voucherId, updateVoucherDto, req.user.branchId);
    }

    @Delete(':voucherId')
    remove(@Param('voucherId') voucherId: string, @Request() req: AuthRequest) {
        return this.voucherService.remove(voucherId, req.user.branchId);
    }

    @Post(':voucherId/approve')
    approve(@Param('voucherId') voucherId: string, @Body() approveDto: ApproveVoucherDto, @Request() req: AuthRequest) {
        return this.voucherService.approve(voucherId, approveDto, req.user.branchId);
    }

    @Post(':voucherId/reject')
    reject(@Param('voucherId') voucherId: string, @Body() rejectDto: RejectVoucherDto, @Request() req: AuthRequest) {
        return this.voucherService.reject(voucherId, rejectDto, req.user.branchId);
    }
}