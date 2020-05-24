import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsDefined } from 'class-validator';

export class UserVerifyResendDto {
  @ApiProperty()
  @IsEmail()
  @IsDefined()
  email: string;
}
