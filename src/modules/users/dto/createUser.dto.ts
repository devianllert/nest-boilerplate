import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  readonly password: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  readonly username: string;
}
