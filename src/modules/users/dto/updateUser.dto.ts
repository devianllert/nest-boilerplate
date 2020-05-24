import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  IsDefined,
} from 'class-validator';

export class UpdateUserDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional()
  @IsDefined()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  readonly password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  readonly newPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  readonly username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  readonly avatar?: string;
}
