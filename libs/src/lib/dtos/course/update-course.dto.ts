import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmpty,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
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
  @IsBoolean()
  status?: boolean;

  @ApiProperty({
    required: false,
    enum: CourseType,
    enumName: 'CourseType',
  })
  @IsOptional()
  @IsEnum(CourseType)
  type?: CourseType;
}
