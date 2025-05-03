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
    getTeachers: builder.query<
      CustomResponse<Pagination<IUser[]>>,
      { search?: string }
    >({
      query: (params) => ({
        url: "/users/teachers",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetTeachersQuery, useCreateUserMutation } = userApi;
