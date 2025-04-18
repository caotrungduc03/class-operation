import { IUser } from "./user";

export enum RequestType {
  WEEKLY_NORM = "WEEKLY_NORM",
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

export interface IRequest {
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestWeeklyNormDto {
  name: string;
  description: string;
  type: RequestType;
  status?: RequestStatus;
  teacherId?: string;
  requesterId?: string;
  approverId?: string;
  weeklyNorms?: WeeklyNormDto[];
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
