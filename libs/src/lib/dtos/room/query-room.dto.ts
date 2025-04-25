import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseRequestDto } from '../common/baseRequest.dto';

export class QueryRoomDto extends BaseRequestDto {
  @ApiProperty({ required: false, description: 'Search by room name' })
  @IsOptional()
  @IsString()
  name?: string;
}
