import { ApiProperty } from '@nestjs/swagger';

export class JwtDTO {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
