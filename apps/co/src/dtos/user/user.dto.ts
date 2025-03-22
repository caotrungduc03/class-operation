import { Expose, Type } from 'class-transformer';
import { BaseDto } from '../common/base.dto';
import { RoleDto } from '../role/role.dto';

export class UserDto extends BaseDto {
  @Expose()
  fullName: string;

  @Expose({
    groups: ['private', 'admin'],
  })
  email: string;

  @Expose({
    groups: ['private', 'admin'],
  })
  phoneNumber: string;

  @Expose()
  avatar: string;

  @Expose({
    groups: ['admin'],
  })
  roleId: number;

  @Expose({
    groups: ['admin'],
  })
  status: boolean;

  @Expose({
    groups: ['admin'],
  })
  lastLogin: Date;

  @Expose({
    groups: ['private'],
  })
  @Type(() => RoleDto)
  role: RoleDto;
}
