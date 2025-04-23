import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { RequestStatus } from '../../enums';
import { CreateWeeklyNormDto } from '../weekly-norm/create-weekly-norm.dto';

/**
 * Weekly Norms Request DTOs
 */
export class CreateWeeklyNormRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @IsOptional()
  @IsUUID()
  creatorId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWeeklyNormDto)
  weeklyNorms: CreateWeeklyNormDto[];

  @IsEmpty()
  status: RequestStatus;
}

/**
 * Time-Offs Request DTOs
 */
export class CreateTimeOffRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

/**
 * Busy Schedules Request DTOs
 */
export class CreateBusySchedulesRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}

// For backward compatibility
export { CreateTimeOffRequestDto as CreateScheduleRequestDto };
