import { CounterType } from '../enums/counter';
import { RoleName } from '../enums/role';

export const ROLE_COUNTER_TYPE_MAP: Record<RoleName, CounterType> = {
  [RoleName.ADMIN]: CounterType.AD,
  [RoleName.TEACHER]: CounterType.GV,
  [RoleName.RECEPTIONIST]: CounterType.NV,
  [RoleName.STUDENT]: CounterType.HV,
};
