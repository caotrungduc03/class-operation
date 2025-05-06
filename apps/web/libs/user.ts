import { RoleName } from "@web/libs/role";
import { ITimestamps } from "./common";
import { IDepartment } from "./department";
import { IField } from "./field";

export interface IUser extends ITimestamps {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  role: IRole;
  detail: IDetailUser;
  status: UserStatus;
  lastLogin?: Date;
  avatar?: string;
}

export interface CreateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  roleName?: RoleName;
  departmentId?: string;
  fieldId?: string;
}

export interface IRole {
  id: string;
  roleName: RoleName;
}

export interface IDetailUser {
  code: string;
  teacherLevel: string;
  field?: IField;
  department?: IDepartment;
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export const STATUS_TAG = {
  [UserStatus.ACTIVE]: "green",
  [UserStatus.BLOCKED]: "red",
} as const;

export const STATUS_LABEL = {
  [UserStatus.ACTIVE]: "Active",
  [UserStatus.BLOCKED]: "Blocked",
} as const;

export const StatusOptions = [
  {
    label: STATUS_LABEL[UserStatus.ACTIVE],
    value: UserStatus.ACTIVE,
  },
  {
    label: STATUS_LABEL[UserStatus.BLOCKED],
    value: UserStatus.BLOCKED,
  },
];
