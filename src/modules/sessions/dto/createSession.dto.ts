import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDTO {
  @ApiProperty()
  token: string;

  @ApiProperty()
  ip: string;

  @ApiProperty()
  userAgent: string;

  @ApiProperty()
  os: string;

  @ApiProperty()
  browser: string;

  @ApiProperty()
  expiresIn: number;
}
