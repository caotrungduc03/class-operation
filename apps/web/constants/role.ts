import { RoleName } from "@web/enums/role";

export const RoleTag = {
  [RoleName.ADMIN]: "red",
  [RoleName.TEACHER]: "blue",
  [RoleName.RECEPTIONIST]: "purple",
  [RoleName.STUDENT]: "green",
};

export const RoleOptions = [
  {
    label: "Admin",
    value: RoleName.ADMIN,
  },
  {
    label: "Teacher",
    value: RoleName.TEACHER,
  },
  {
    label: "Receptionist",
    value: RoleName.RECEPTIONIST,
  },
  {
    label: "Student",
    value: RoleName.STUDENT,
  },
];
