import { NAV_LINK } from "@web/libs/nav";
import { RoleName } from "@web/libs/role";
import { IUser } from "@web/libs/user";

export const LMS_ROLES = [RoleName.TEACHER];
export const OPS_ROLES = [RoleName.ADMIN, RoleName.RECEPTIONIST];

export const canAccessLMS = (user?: IUser): boolean => {
  if (!user) return false;
  return LMS_ROLES.includes(user.role.roleName);
};

export const canAccessOPS = (user?: IUser): boolean => {
  if (!user) return false;
  return OPS_ROLES.includes(user.role.roleName);
};

export const canAccessStudent = (user?: IUser): boolean => {
  if (!user) return false;
  return user.role.roleName === RoleName.STUDENT;
};

export const getHomePathForUser = (user?: IUser): string => {
  if (!user) return NAV_LINK.LOGIN;

  if (canAccessOPS(user)) {
    return NAV_LINK.OPS;
  }

  if (canAccessLMS(user)) {
    return NAV_LINK.LMS;
  }

  if (canAccessStudent(user)) {
    return NAV_LINK.STUDENT;
  }

  return NAV_LINK.LOGIN;
};
