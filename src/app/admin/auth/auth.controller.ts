// src/auth/auth.controller.ts
import { JwtService } from '@nestjs/jwt';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  HttpCode,
  Req,
  UseGuards,
  BadRequestException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { resetPasswordDto } from './dto/forget-password.dto';
import { LoginAuthDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';
import { JwtOrDeviceRequest } from 'src/interfaces/JwtOrDeviceRequest';
import { Response, Request } from 'express';
import { AuthRequest } from 'src/interfaces/AuthRequest';
import { AuthAdminService } from './auth.service';
import { TokenService } from 'src/common/token/token.service';

@Controller('admin/auth')
export class AuthAdminController {
  constructor(
    private readonly authService: AuthAdminService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}



 @Post('login')
async login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
}

  @Post('signout')
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // تم إزالة المنطق الخاص بالكوكيز من هنا
    return {
      statusCode: HttpStatus.OK,
      message: 'Signed out successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reset-password')
  resetPassword(
    @Req() req: AuthRequest,
    @Body() resetPassword: resetPasswordDto,
  ) {
    return this.authService.resetPassword(req.user._id, resetPassword);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
}