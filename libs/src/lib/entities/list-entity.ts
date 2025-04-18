import { CounterEntity } from './counter.entity';
import { RequestEntity } from './request.entity';
import { RoleEntity } from './role.entity';
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
] as const;
