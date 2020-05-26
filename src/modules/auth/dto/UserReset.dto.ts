import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDefined } from 'class-validator';

export class UserResetDTO {
  @ApiProperty()
  @IsDefined()
  @IsString()
  readonly token: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  readonly password: string;
}
