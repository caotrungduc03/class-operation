import { CounterEntity } from './counter.entity';
import { RoleEntity } from './role.entity';
import { UserDetail } from './user-detail.entity';
import { UserEntity } from './user.entity';

export const ListEntity = [
  RoleEntity,
  UserEntity,
  UserDetail,
  CounterEntity,
] as const;
