import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDefined } from 'class-validator';

export class UserVerifyDTO {
  @ApiProperty()
  @IsString()
  @IsDefined()
  token: string;
}
