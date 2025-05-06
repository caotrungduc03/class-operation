import { Expose, Type } from 'class-transformer';
import { BaseDto } from '../common/base.dto';
import { UserDto } from '../user/user.dto';

export class FieldDto extends BaseDto {
  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  leaderId: string;

  @Expose({ groups: ['admin'] })
  @Type(() => UserDto)
  leader: UserDto;
}
