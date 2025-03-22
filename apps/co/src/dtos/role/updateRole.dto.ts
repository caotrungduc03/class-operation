import { IsNotEmpty } from 'class-validator';
import { BaseRequestDto } from '../common/baseRequest.dto';

export class UpdateRoleDto extends BaseRequestDto {
  @IsNotEmpty()
  roleName: string;
}
