import { RoleName } from "@web/enums/role";
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
