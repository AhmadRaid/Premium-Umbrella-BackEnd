import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  UseGuards,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CarTypeService } from './type-cars.service';
import { CreateCarTypeDto } from './dto/create-car-type.dto';
import { PaginationDto } from 'src/common/pagination-dto/pagination.dto';
import { CarSize } from 'src/schemas/carTypes.schema';
import { userRoles } from 'src/common/enum/userRoles.enum';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';
import { JwtAuthAdminGuard } from 'src/common/guards/jwtAuthAdminGuard';
import { AdminRoles } from 'src/common/enum/adminRoles.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/RolesGuard';

@Controller('admin/car-types')
@UseGuards(JwtAuthGuard)
export class CarTypeController {
  constructor(private readonly carTypeService: CarTypeService) {}

  // ↓ هذا الروت متاح لكل من admin و employee
  @Get()
  async getCarTypes(
    @Query('search') searchTerm?: string,
    @Query('size') sizeTerm?: CarSize,
    @Query('manufacturer') manufacturerTerm?: string,
    @Query('isActive') isActiveTerm?: boolean,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    try {
      if (limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }
      if (offset < 0) {
        throw new BadRequestException('Offset must be positive');
      }

      const paginationDto: PaginationDto = {
        offset,
        limit,
      };

      return await this.carTypeService.getCarTypes(
        searchTerm,
        sizeTerm,
        manufacturerTerm,
        isActiveTerm,
        paginationDto,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to process car type request');
    }
  }

  @Post()
  @Roles(AdminRoles.ADMIN)
  create(@Body() createCarTypeDto: CreateCarTypeDto) {
    return this.carTypeService.create(createCarTypeDto);
  }

  @Get(':carTypeId')
  // @Role(userRoles.ADMIN, userRoles.EMPLOYEE)
  findOne(@Param('carTypeId') carTypeId: string) {
    return this.carTypeService.findOne(carTypeId);
  }

  @Put(':carTypeId')
  @UseGuards(JwtAuthAdminGuard)
  // @Role(userRoles.ADMIN)
  update(@Param('carTypeId') carTypeId: string, @Body() updateCarTypeDto: CreateCarTypeDto) {
    return this.carTypeService.update(carTypeId, updateCarTypeDto);
  }

  @Delete(':carTypeId')
  @UseGuards(JwtAuthAdminGuard)
  //  @Role(userRoles.ADMIN)
  remove(@Param('carTypeId') carTypeId: string) {
    return this.carTypeService.remove(carTypeId);
  }

  @Get('search/:name')
  // @Role(userRoles.ADMIN, userRoles.EMPLOYEE)
  searchByName(@Param('name') name: string) {
    return this.carTypeService.searchByName(name);
  }
}
