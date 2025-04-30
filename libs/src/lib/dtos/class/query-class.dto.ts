import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserStatus } from '../../enums';

export class QueryClassDto {
  @ApiProperty({ required: false, description: 'Search by class name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Filter by course ID' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiProperty({ required: false, description: 'Filter by teacher ID' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiProperty({ required: false, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ required: false, description: 'Filter by start date (from)' })
  @IsOptional()
  @IsDateString()
  startDateFrom?: Date;

  @ApiProperty({ required: false, description: 'Filter by start date (to)' })
  @IsOptional()
  @IsDateString()
  startDateTo?: Date;
}
