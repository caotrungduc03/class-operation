import { Expose, Transform, Type } from 'class-transformer';
import { BaseDto } from '../common/base.dto';
import { RoleDto } from '../role/role.dto';

export class UserDto extends BaseDto {
  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  @Transform(({ obj }) => `${obj.lastName} ${obj.firstName}`)
  fullName: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  avatar: string;

  @Expose({
    groups: ['admin'],
  })
  status: boolean;

  @Expose({
    groups: ['admin'],
  })
  lastLogin: Date;

  @Expose()
  @Type(() => RoleDto)
  role: RoleDto;
}
