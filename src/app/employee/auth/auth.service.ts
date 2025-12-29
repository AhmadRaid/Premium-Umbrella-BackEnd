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
import { decode } from 'punycode';
import { TokenBlacklist } from 'src/schemas/token-blacklist.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Response } from 'express';

@Injectable()
export class AuthEmployeeService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Verification.name)
    private verificationModel: Model<Verification>,
    private jwtService: JwtService,
    private tokenService: TokenService,
    @InjectModel(TokenBlacklist.name)
    private tokenBlacklistModel: Model<TokenBlacklist>,
  ) {}

  async createEmployee(createEmployee: SignUpAuthDto) {
    const { fullName, employeeId, password, branch, role } = createEmployee;
    const existingEmployeeIdUser = await this.userModel.findOne({
      employeeId,
      isDeleted: false,
    });
    if (existingEmployeeIdUser) {
      throw new BadRequestException('EMPLOYEEID_EXIST');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      employeeId,
      password: hashedPassword,
      fullName,
      branch: new Types.ObjectId(branch),
      role,
    });
    await newUser.save();
    return {
      message: 'USER.CREATED',
    };
  }

  async login(loginAuthDto: LoginAuthDto) {
    const { employeeId, branch, password } = loginAuthDto;

    // 1. البحث عن المستخدم بواسطة معرف الموظف فقط في البداية
    const user = await this.userModel.findOne({
      employeeId: employeeId,
      isDeleted: false,
    });

    // التحقق من وجود المستخدم
    if (!user) {
      throw new UnauthorizedException('الموظف غير مسجل');
    }

    const isAdmin = user.role === 'admin';

    if (!isAdmin) {
      if (!branch) {
        throw new UnauthorizedException('يجب تحديد الفرع للموظفين');
      }

      const hasBranchAccess = user.branch.some(
        (b) => b.toString() === branch.toString(),
      );

      if (!hasBranchAccess) {
        throw new UnauthorizedException('الموظف غير مسجل في هذا الفرع');
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    const payload = {
      employeeId: user.employeeId,
      _id: user._id,
      role: user.role,
      branch: isAdmin ? null : branch,
    };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    await this.tokenService.storeRefreshToken(
      user._id.toString(),
      refreshToken,
    );

    // تحديث وقت آخر تسجيل دخول
    // user.lastLoginAt = new Date(); // تأكد من إضافة الحقل في السكيما إذا أردت تفعيله
    await user.save();

    return {
      accessToken,
      user: new UserResponseDto(user),
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
