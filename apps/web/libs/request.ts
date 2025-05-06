import { ITimestamps } from "./common";
import { IUser } from "./user";

export enum RequestType {
  WEEKLY_NORM = "WEEKLY_NORM",
  TIME_OFF = "TIME_OFF",
  BUSY_SCHEDULE = "BUSY_SCHEDULE",
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELED = "CANCELED",
}

export interface WeeklyNormDto {
  id?: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
  teacherId?: string;
}

export interface ITimeOff {
  date: Date;
  startTime: Date;
  endTime: Date;
}

export interface IRequest extends ITimestamps {
  id: string;
  name: string;
  description: string;
  type: RequestType;
  status?: RequestStatus;
  creatorId: string;
  creator: IUser;
  requesterId?: string;
  requester?: IUser;
  approverId?: string;
  approver?: IUser;
  teacherId?: string;
  weeklyNorms?: WeeklyNormDto[];
  timeOff?: ITimeOff;
}

export interface CreateRequestWeeklyNormDto {
  name: string;
  description: string;
  status?: RequestStatus;
  teacherId?: string;
  requesterId?: string;
  approverId?: string;
  weeklyNorms?: WeeklyNormDto[];
}

export interface CreateRequestTimeOffDto {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

export interface CreateRequestBusyScheduleDto {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

export const RequestStatusOptions = [
  {
    value: RequestStatus.PENDING,
    label: "Pending",
  },
  {
    value: RequestStatus.APPROVED,
    label: "Approved",
  },
  {
    value: RequestStatus.REJECTED,
    label: "Rejected",
  },
  {
    value: RequestStatus.CANCELED,
    label: "Canceled",
  },
];

export enum RequestAction {
  APPROVE = "APPROVE",
  CANCEL = "CANCEL",
}

export const REQUEST_STATUS_TAG = {
  [RequestStatus.PENDING]: "warning",
  [RequestStatus.APPROVED]: "success",
  [RequestStatus.REJECTED]: "error",
  [RequestStatus.CANCELED]: "default",
} as const;
