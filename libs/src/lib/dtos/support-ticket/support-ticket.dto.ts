import { Expose, Type } from 'class-transformer';
import { RequestPriority } from '../../enums';
import { ClassDto } from '../class/class.dto';
import { BaseDto } from '../common/base.dto';
import { RequestDto } from '../request/request.dto';

export class SupportTicketDto extends BaseDto {
  @Expose()
  @Type(() => ClassDto)
  class: ClassDto;

  @Expose()
  @Type(() => RequestDto)
  request: RequestDto;

  @Expose()
  priority: RequestPriority;

  @Expose()
  note: string;
}
