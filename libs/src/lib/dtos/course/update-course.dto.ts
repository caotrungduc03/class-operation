import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../../enums';
import { CourseType } from '../../enums/course.enum';

export class UpdateCourseDto {
  @IsEmpty()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    required: false,
    enum: CourseType,
    enumName: 'CourseType',
  })
  @IsOptional()
  @IsEnum(CourseType)
  type?: CourseType;
}
