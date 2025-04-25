import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../../enums/request.enum';

export class GetRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}
