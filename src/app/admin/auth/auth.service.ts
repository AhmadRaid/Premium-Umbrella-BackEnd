// src/auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/schemas/user.schema';
import { SignUpAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { resetPasswordDto } from './dto/resetPassword.dto';
import { Verification } from 'src/schemas/verification.schema';
import { NewPasswordDto } from './dto/new-password.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { TokenService } from 'src/common/token/token.service';
import { TokenBlacklist } from 'src/schemas/token-blacklist.schema';
import { Response } from 'express';

@Injectable()
export class AuthAdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Verification.name)
    private verificationModel: Model<Verification>,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}

  async login(loginAuthDto: LoginAuthDto) {
    const { employeeId, password } = loginAuthDto;

    const admin = await this.userModel.findOne({
      employeeId,
      role: 'admin',
      isDeleted: false,
    });

    if (!admin) {
      throw new UnauthorizedException('الادمن غير مسجل');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    const payload = {
      _id: admin._id,
      role: admin.role,
    };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    await this.tokenService.storeRefreshToken(
      admin._id.toString(),
      refreshToken,
    );

    await admin.save();

    return {
      accessToken,
      admin: new UserResponseDto(admin),
    };
  }

  async generateTokens(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { _id: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '10d',
    });
    return { accessToken, refreshToken };
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.userModel.findOne({ email: decoded.email });
      if (!user) throw new UnauthorizedException('User not found');
      const isValid = await this.tokenService.isRefreshTokenValid(
        decoded._id,
        refreshToken,
      );
      if (!isValid) throw new UnauthorizedException('Invalid refresh token');
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async resetPassword(userId: string, resetPassword: resetPasswordDto) {
    const { currentPassword, newPassword } = resetPassword;
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('USER.NOT_FOUND');
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('PASSWORD.CURRNET_PASSWROD_NOT_CORRECT');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return { message: 'PASSWORD.UPDATED' };
  }

  async generatePassword(generatePassword: NewPasswordDto) {
    const { userId, newPassword } = generatePassword;
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('USER.NOT_FOUND');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return { message: 'PASSWORD.UPDATED' };
  }

  async forgetPassword(ForgetPasswordBody: ForgetPasswordDto) {
    const { email } = ForgetPasswordBody;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('EMAIL_EXIST');
    }
    this.generateVerificationCode(user._id);
    return {
      userId: user._id,
      message: 'VERIFICATION.SEND_CODE',
    };
  }

  async verifyCode(userId: string, verificationCode: string) {
    const verification = await this.verificationModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!verification) {
      throw new NotFoundException('VERIFICATION.VERIFICATION_TIMEOUT');
    }
    const isMatch = await bcrypt.compare(
      verificationCode,
      verification.verificationCode,
    );
    if (!isMatch) {
      throw new BadRequestException(
        'VERIFICATION.VERIFICATION_CODE_NOT_CORRECT',
      );
    }
    return { message: 'VERIFICATION.VERIFICATION_SUCCEFULL' };
  }

  async generateVerificationCode(userId: any): Promise<{ code: string }> {
    const code = '12345';
    const hashedCode = await bcrypt.hash(code, 10);
    const verification = new this.verificationModel({
      user: userId,
      verificationCode: hashedCode,
    });
    await verification.save();
    console.log(verification);
    return { code: '12345' };
  }

  async signOut(res: Response, token: string): Promise<void> {
    try {
      const decodedToken = this.jwtService.decode(token) as { exp: number };
      const expiresAt = new Date(decodedToken.exp * 1000);
      await this.tokenService.blacklistToken(token, expiresAt);
      // تم إزالة المنطق الخاص بـ res.clearCookie
    } catch (error) {
      throw new UnauthorizedException('Sign out failed');
    }
  }
}
