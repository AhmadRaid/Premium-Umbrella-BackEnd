import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserEmployeeService } from './user.service';
import { AddressDto } from './dto/create-address.dto';
import { Address } from 'cluster';
import { AuthRequest } from 'src/interfaces/AuthRequest';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';
import { FileInterceptor } from '@nestjs/platform-express';
import { generateUploadConfig } from 'src/config/upload.file.config';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthCompositeGuard } from 'src/common/guards/AuthCompositeGuard';

@Controller('user')
@UseGuards(AuthCompositeGuard)
export class UserEmployeeController {
  constructor(private readonly userService: UserEmployeeService) {}

  @Get('profile')
  async findOne(@Req() req: AuthRequest) {
    return this.userService.findOne(req.user._id);
  }

  @Get('get-employees')
  async getAllUser(@Req() req: AuthRequest) {
    return this.userService.getAllUsers();
  }

  // @UseInterceptors(FileInterceptor('image', generateUploadConfig('users')))
  // @Patch('profile')
  // async updateProfileData(
  //   @Req() req: AuthRequest,
  //   @UploadedFile() image: Express.Multer.File,
  //   @Body() updateData: UpdateProfileDto,
  // ) {
  //   return this.userService.updateProfileData(req.user._id, image, updateData);
  // }
}
