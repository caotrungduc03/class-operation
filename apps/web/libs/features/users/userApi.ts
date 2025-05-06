import { createApi } from "@reduxjs/toolkit/query/react";
import { CustomResponse, Pagination } from "@web/libs/common";
import { baseFetchQuery } from "@web/libs/customBaseQuery";
import { CreateUserDto, IUser } from "@web/libs/user";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseFetchQuery,
  endpoints: (builder) => ({
    createUser: builder.mutation<CustomResponse<IUser>, CreateUserDto>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
    }),
    updateUser: builder.mutation<
      CustomResponse<IUser>,
      { id: string; body: CreateUserDto }
    >({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteUser: builder.mutation<CustomResponse<void>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
    }),
    getTeachers: builder.query<
      CustomResponse<Pagination<IUser[]>>,
      { search?: string; roleName?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/users/teachers",
        method: "GET",
        params,
      }),
    }),
    getStudents: builder.query<
      CustomResponse<Pagination<IUser[]>>,
      { search?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/users/students",
        method: "GET",
        params,
      }),
    }),
    getStaffs: builder.query<
      CustomResponse<Pagination<IUser[]>>,
      { search?: string; roleName?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/users/staffs",
        method: "GET",
        params,
      }),
    }),
    getManagers: builder.query<
      CustomResponse<Pagination<IUser[]>>,
      { search?: string; roleName?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/users/managers",
        method: "GET",
        params,
      }),
    }),
    getUserById: builder.query<CustomResponse<IUser>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetStudentsQuery,
  useGetStaffsQuery,
  useGetManagersQuery,
  useGetUserByIdQuery,
} = userApi;
