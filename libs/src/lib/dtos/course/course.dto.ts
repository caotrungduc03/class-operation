import { Expose } from 'class-transformer';
import { CourseType } from '../../enums/course.enum';
import { BaseDto } from '../common/base.dto';

export class CourseDto extends BaseDto {
  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  status: boolean;

  @Expose()
  type: CourseType;
}
