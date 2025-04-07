import { RoleName } from "@web/enums/user";
import { ITimestamps } from "./common";

export interface IUser extends ITimestamps {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: IRole;
  detail: IDetailUser;
}

export interface IRole {
  id: string;
  roleName: RoleName;
}

export interface IDetailUser {
  code: string;
}
