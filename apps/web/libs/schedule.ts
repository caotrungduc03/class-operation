import { ITimestamps } from "./common";
import { UserStatus } from "./user";

export enum ScheduleType {
  BUSY = "BUSY",
  TEACHING = "TEACHING",
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
  classId?: string;
}

export const SCHEDULE_TYPE_LABEL = {
  [ScheduleType.BUSY]: "Lịch bận",
  [ScheduleType.TEACHING]: "Lịch dạy",
} as const;

export const SCHEDULE_TYPE_TAG = {
  [ScheduleType.BUSY]: "error",
  [ScheduleType.TEACHING]: "success",
} as const;

export const SCHEDULE_TYPE_OPTIONS = [
  {
    value: ScheduleType.BUSY,
    label: SCHEDULE_TYPE_LABEL[ScheduleType.BUSY],
  },
  {
    value: ScheduleType.TEACHING,
    label: SCHEDULE_TYPE_LABEL[ScheduleType.TEACHING],
  },
];

export interface CreateTeachingScheduleDto {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  classId: string;
}
