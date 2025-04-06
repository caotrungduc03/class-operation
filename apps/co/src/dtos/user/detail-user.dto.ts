import { Expose } from 'class-transformer';
import { BaseDto } from '../common/base.dto';

export class DetailUserDto extends BaseDto {
  @Expose()
  code: string;
}
