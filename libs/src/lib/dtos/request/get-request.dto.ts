import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../../enums/request.enum';
import { PaginationRequestDto } from '../common/pagination-request.dto';

export class GetRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}
