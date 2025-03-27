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
