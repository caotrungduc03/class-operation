import { ClassEntity } from './class.entity';
import { CounterEntity } from './counter.entity';
import { CourseEntity } from './course.entity';
import { NotificationEntity } from './notification.entity';
import { RequestEntity } from './request.entity';
import { RoleEntity } from './role.entity';
import { RoomEntity } from './room.entity';
import { ScheduleEntity } from './schedule.entity';
import { StudentClassEntity } from './student-class.entity';
import { UserDetail } from './user-detail.entity';
import { UserEntity } from './user.entity';
import { WeeklyNormEntity } from './weekly-norm.entity';

export const ListEntity = [
  RoleEntity,
  UserEntity,
  UserDetail,
  CounterEntity,
  RequestEntity,
  WeeklyNormEntity,
  ScheduleEntity,
  RoomEntity,
  CourseEntity,
  ClassEntity,
  StudentClassEntity,
  NotificationEntity,
] as const;
