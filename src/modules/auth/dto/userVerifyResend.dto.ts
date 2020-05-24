import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsDefined } from 'class-validator';

export class UserVerifyResendDTO {
  @ApiProperty()
  @IsEmail()
  @IsDefined()
  email: string;
}
