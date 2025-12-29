import { IsPhoneNumber } from 'class-validator';
import { User } from 'src/schemas/user.schema';

export class UserResponseDto {
  _id: string;
  @IsPhoneNumber(null, {
    message:
      'The phoneNumber must be a valid international phone number starting with a "+" followed by the country code and real, valid phone number.',
  })
  phoneNumber: string;
  fullName: string | null;
  email: string | null;
  image: string | null;
  status: string;
  role: string;

  constructor(user:User) {
    this.fullName = user.fullName ? user.fullName : null;
    this.image = user.image ? user.image : null;
    this.status = user.status;
    this.role = user.role;
  }
}
