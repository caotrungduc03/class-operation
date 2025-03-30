import { MenuProps } from "antd";

// Types
export type MenuItem = Required<MenuProps>["items"][number];

// Interfaces
export interface ITimestamps {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CustomResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface NavigationItem {
  key?: React.Key;
  icon?: React.ReactNode;
  label: React.ReactNode;
  url?: string;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  url: string;
}
