import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourseType } from '../../enums/course.enum';

export class CreateCourseDto {
  @IsEmpty()
  code: string;

  @ApiProperty({ description: 'Course name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false, description: 'Course description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    description: 'Course status',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty({
    description: 'Course type',
    enum: CourseType,
    enumName: 'CourseType',
  })
  @IsNotEmpty()
  @IsEnum(CourseType)
  type: CourseType;
}
