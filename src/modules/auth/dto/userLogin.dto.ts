import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDefined,
} from 'class-validator';

export class UserLoginDTO {
  @ApiProperty()
  @IsDefined()
  @IsString()
  readonly emailOrUsername: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  readonly password: string;
}
