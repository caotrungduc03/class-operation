import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CustomResponse, Pagination } from "@web/libs/common";
import { RootState } from "@web/libs/store";
import { CreateUserDto, IUser } from "@web/libs/user";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

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
