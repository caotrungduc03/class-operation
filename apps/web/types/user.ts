import { ROLE_NAME } from "@web/constants/user";
import { ITimestamps } from "./common";

export type RoleName = keyof typeof ROLE_NAME;

export interface IUser extends ITimestamps {
  id: string;
  email: string;
  fullName: string;
  role: IRole;
}

export interface IRole {
  id: string;
  roleName: RoleName;
}
