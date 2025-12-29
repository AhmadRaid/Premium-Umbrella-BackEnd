import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UserEmployeeService } from 'src/app/employee/user/user.service';
import { UserEmployeeController } from 'src/app/employee/user/user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
  ],
  controllers: [UserController, UserEmployeeController],
  providers: [UserService, UserEmployeeService],
  exports: [UserService],
})
export class UserModule {}
