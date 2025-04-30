import { UserStatus } from "./user";

export interface IRoom {
  id: string;
  code: string;
  name: string;
  quantity: number;
  location: string;
  description: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  code?: string;
  name?: string;
  quantity?: number;
  location?: string;
  description?: string;
  status?: UserStatus;
}
