import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsDefined } from 'class-validator';

export class UserVerifyDTO {
  @ApiProperty()
  @IsString()
  @IsDefined()
  token: string;

  @ApiProperty()
  @IsEmail()
  @IsDefined()
  email: string;
}
