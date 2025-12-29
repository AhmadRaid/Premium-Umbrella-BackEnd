import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './service.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { JwtAuthAdminGuard } from 'src/common/guards/jwtAuthAdminGuard';

@Controller('admin/services')
@UseGuards(JwtAuthAdminGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // // في controller
  // @Post(':orderId/add-service')
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async addServiceToOrder(
  //   @Param('orderId') orderId: string,
  //   @Body() serviceRequest: any,
  // ) {
  //   return this.servicesService.addServiceToOrder(orderId, serviceRequest);
  // }

  @Get()
  async findAll() {
    return await this.servicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.servicesService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve service');
    }
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    try {
      return await this.servicesService.update(id, updateServiceDto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update service');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.servicesService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete service');
    }
  }
}
