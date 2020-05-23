import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
  IsDefined,
} from 'class-validator';

export class UserRegisterDTO {
  @ApiProperty()
  @IsDefined()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  readonly password: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  readonly username: string;
}
