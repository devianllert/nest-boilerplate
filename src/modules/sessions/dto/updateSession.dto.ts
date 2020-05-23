import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionDTO {
  @ApiProperty()
  token: string;

  @ApiProperty()
  expiresIn: number;
}
