export enum RoleName {
  ADMIN = "ADMIN",
  MANAGE = "MANAGE",
  STAFF_ACADEMIC = "STAFF_ACADEMIC",
  STAFF_GENERAL = "STAFF_GENERAL",
  TEACHER_PART_TIME = "TEACHER_PART_TIME",
  TEACHER_FULL_TIME = "TEACHER_FULL_TIME",
  RECEPTIONIST = "RECEPTIONIST",
  STUDENT = "STUDENT",
}

export const RoleTag = {
  [RoleName.ADMIN]: "red",
  [RoleName.MANAGE]: "orange",
  [RoleName.STAFF_ACADEMIC]: "cyan",
  [RoleName.STAFF_GENERAL]: "magenta",
  [RoleName.TEACHER_FULL_TIME]: "blue",
  [RoleName.TEACHER_PART_TIME]: "geekblue",
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
    value: RoleName.TEACHER_PART_TIME,
  },
  {
    label: "Teacher",
    value: RoleName.TEACHER_FULL_TIME,
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
