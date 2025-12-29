import { Global, Module, forwardRef } from '@nestjs/common';
import { AuthAdminService } from './auth.service';
import { AuthAdminController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Verification, VerificationSchema } from 'src/schemas/verification.schema';
import { TokenModule } from 'src/common/token/token.module';
import { TokenBlacklist, TokenBlacklistSchema } from 'src/schemas/token-blacklist.schema';
import { AuthEmployeeService } from 'src/app/employee/auth/auth.service';
import { AuthEmployeeController } from 'src/app/employee/auth/auth.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Verification.name, schema: VerificationSchema },
      { name: TokenBlacklist.name, schema: TokenBlacklistSchema },
    ]),
    JwtModule.register({
      secret: 'TRUST4d2f8b56932d',
      signOptions: { expiresIn: '90d' },
    }),
    TokenModule
  ],
  controllers: [AuthAdminController,AuthEmployeeController],
  providers: [AuthAdminService,AuthEmployeeService],
  exports: [AuthAdminService,AuthEmployeeService, JwtModule, MongooseModule],
})
export class AuthModule {}
