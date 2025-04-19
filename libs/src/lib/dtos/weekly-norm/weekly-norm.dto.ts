import { Exclude, Expose, Type } from 'class-transformer';
import { BaseDto } from '../common/base.dto';
import { RequestDto } from '../request/request.dto';

@Exclude()
export class WeeklyNormDto extends BaseDto {
  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  quantity: number;

  @Expose()
  status: boolean;

  @Expose()
  @Type(() => RequestDto)
  request: RequestDto;
}
