import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { RequestStatus, RequestType } from '../../enums';
import { CreateWeeklyNormDto } from '../weekly-norm/create-weekly-norm.dto';

export class CreateRequestWeeklyNormDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsEnum(RequestType)
  type: RequestType;

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
