import { RoleName } from "@web/libs/role";
import { ITimestamps } from "./common";

export interface IUser extends ITimestamps {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  role: IRole;
  detail: IDetailUser;
  status: boolean;
  lastLogin?: Date;
  avatar?: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  roleName: RoleName;
}

export interface IRole {
  id: string;
  roleName: RoleName;
}

export interface IDetailUser {
  code: string;
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export const StatusTag = {
  [UserStatus.ACTIVE]: "green",
  [UserStatus.BLOCKED]: "red",
};

export const StatusOptions = [
  {
    label: "Active",
    value: UserStatus.ACTIVE,
  },
  {
    label: "Blocked",
    value: UserStatus.BLOCKED,
  },
];
