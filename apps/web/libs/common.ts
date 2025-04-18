import { MenuProps } from "antd";
import { FixedType } from "rc-table/lib/interface";

// Types
export type MenuItem = Required<MenuProps>["items"][number];

export type Placement =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight"
  | "top"
  | "bottom";

// Interfaces
export interface ITimestamps {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CustomResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface Pagination<T> {
  page: number;
  limit: number;
  total: number;
  items: T;
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

export interface OtherColumn {
  index: string | number;
  method: React.ReactNode;
}

export interface TableColumn<T, O = OtherColumn> {
  title: React.ReactNode;
  dataIndex: keyof T | keyof O;
  key?: string | number;
  width?: number | string;
  render?: (value: any) => React.ReactNode;
  fixed?: FixedType;
}
