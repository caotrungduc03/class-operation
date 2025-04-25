import { CounterType, RoleName } from '../enums';

export const ROLE_COUNTER_TYPE: Record<RoleName, CounterType> = {
  [RoleName.ADMIN]: CounterType.AD,
  [RoleName.TEACHER]: CounterType.GV,
  [RoleName.RECEPTIONIST]: CounterType.NV,
  [RoleName.STUDENT]: CounterType.HV,
};
