import { UserStatus } from "@web/enums/user";

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
