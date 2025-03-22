import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';
import { BaseRequestDto } from '../common/baseRequest.dto';

export class CreateUserDto extends BaseRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(3)
  fullName: string;

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
    }
  )
  password: string;

  @ApiProperty()
  confirmPassword: string;

  @ApiProperty()
  phoneNumber: string;

  @IsEmpty()
  avatar: string;

  @Type(() => Number)
  roleId: number;

  @Type(() => Number)
  status: number;
}
