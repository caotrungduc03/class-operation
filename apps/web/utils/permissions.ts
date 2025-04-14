import { NAV_LINK } from "@web/constants/nav";
import { RoleName } from "@web/enums/role";
import { IUser } from "@web/types/user";

export const LMS_ROLES = [RoleName.TEACHER, RoleName.STUDENT];
export const OPS_ROLES = [RoleName.ADMIN, RoleName.RECEPTIONIST];

export const canAccessLMS = (user?: IUser): boolean => {
  if (!user) return false;
  return LMS_ROLES.includes(user.role.roleName);
};

export const canAccessOPS = (user?: IUser): boolean => {
  if (!user) return false;
  return OPS_ROLES.includes(user.role.roleName);
};

export const getHomePathForUser = (user?: IUser): string => {
  if (!user) return NAV_LINK.LOGIN;

  if (canAccessOPS(user)) {
    return NAV_LINK.OPS;
  }

  if (canAccessLMS(user)) {
    return NAV_LINK.LMS;
  }

  return NAV_LINK.LOGIN;
};
