// src/auth/auth.controller.ts
import { JwtService } from '@nestjs/jwt';
import { AuthRequest } from '../../interfaces/AuthRequest';
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
import { JwtAuthAdminGuard } from 'src/common/guards/jwtAuthAdminGuard';
import { resetPasswordDto } from './dto/forget-password.dto';
import { SignUpAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';
import { NewPasswordDto } from './dto/new-password.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { TokenService } from 'src/common/token/token.service';
import { JwtOrDeviceRequest } from 'src/interfaces/JwtOrDeviceRequest';
import { userRoles } from 'src/common/enum/userRoles.enum';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signup')
  createUser(@Body() singUpAuthDto: SignUpAuthDto) {
    return this.authService.createEmployee(singUpAuthDto);
  }

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

  @Post('check-email-send-code')
  forgetPassword(@Body() ForgetPasswordBody: ForgetPasswordDto) {
    return this.authService.forgetPassword(ForgetPasswordBody);
  }

  @Post('check-verification-code')
  verifyCode(@Body() verifyCodeDto: { userId: string; code: string }) {
    const { userId, code } = verifyCodeDto;
    return this.authService.verifyCode(userId, code);
  }

  @Post('generate-password')
  generatePassword(@Body() ForgetPasswordBody: NewPasswordDto) {
    return this.authService.generatePassword(ForgetPasswordBody);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
}