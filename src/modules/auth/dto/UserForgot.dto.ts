import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDefined } from 'class-validator';

export class UserForgotDTO {
  @ApiProperty()
  @IsDefined()
  @IsString()
  readonly emailOrUsername: string;
}
