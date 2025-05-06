import { ITimestamps } from "./common";
import { UserStatus } from "./user";

export enum ScheduleType {
  BUSY = "BUSY",
}

export interface ISchedule extends ITimestamps {
  id: string;
  name: string;
  description: string;
  type: ScheduleType;
  startDate: string;
  endDate: string;
  status: UserStatus;
  requestId: string;
  teacherId: string;
}

export const SCHEDULE_TYPE_LABEL = {
  [ScheduleType.BUSY]: "Lịch bận",
} as const;

export const SCHEDULE_TYPE_TAG = {
  [ScheduleType.BUSY]: "error",
} as const;

export const SCHEDULE_TYPE_OPTIONS = [
  {
    value: ScheduleType.BUSY,
    label: SCHEDULE_TYPE_LABEL[ScheduleType.BUSY],
  },
];
