import { RoleName } from '@co/types';
import { IsNotEmpty } from 'class-validator';
import { BaseRequestDto } from '../common/baseRequest.dto';

export class CreateRoleDto extends BaseRequestDto {
  @IsNotEmpty()
  roleName: RoleName;
}
