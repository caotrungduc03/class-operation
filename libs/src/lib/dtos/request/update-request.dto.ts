import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { RequestType } from '../../enums/request.enum';

export class UpdateRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType;

  @IsUUID()
  @IsOptional()
  requesterId?: string;

  @IsUUID()
  @IsOptional()
  approverId?: string;
}
