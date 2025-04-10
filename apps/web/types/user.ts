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
  avatar?: string;
}

export interface IRole {
  id: string;
  roleName: RoleName;
}

export interface IDetailUser {
  code: string;
}
