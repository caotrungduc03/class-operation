import { ICourse } from "./course";
import { IRoom } from "./room";
import { IUser, UserStatus } from "./user";

export interface IClass {
  id: string;
  code: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  quantity: number;
  status: UserStatus;
  courseId: string;
  teacherId: string;
  roomId: string;
  createdAt: string;
  updatedAt: string;
  course?: ICourse;
  teacher?: IUser;
  room?: IRoom;
}

export interface CreateClassDto {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  quantity?: number;
  status?: UserStatus;
  courseId: string;
  teacherId?: string;
  roomId?: string;
}

export interface UpdateClassDto {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  quantity?: number;
  status?: UserStatus;
  teacherId?: string;
  roomId?: string;
}

export interface QueryClassDto {
  name?: string;
  courseId?: string;
  teacherId?: string;
  status?: UserStatus;
  startDateFrom?: string;
  startDateTo?: string;
  page?: number;
  limit?: number;
}
