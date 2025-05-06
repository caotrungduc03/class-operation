import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { RoleName } from '../../enums';
import { BaseRequestDto } from '../common/baseRequest.dto';

export class CreateUserDto extends BaseRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(1)
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(1)
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must have at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty()
  confirmPassword: string;

  @ApiProperty()
  phoneNumber: string;

  @IsEmpty()
  avatar: string;

  @ApiProperty()
  @IsEnum(RoleName)
  roleName: RoleName;

  @Type(() => Number)
  status: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  fieldId?: string;
}
