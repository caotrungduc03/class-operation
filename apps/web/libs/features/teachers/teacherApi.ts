import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@web/libs/store";
import { CustomResponse, Pagination } from "@web/types/common";
import { IUser } from "@web/types/user";

export const teacherApi = createApi({
  reducerPath: "teacherApi",
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
    getTeachers: builder.query<CustomResponse<Pagination<IUser[]>>, {}>({
      query: () => ({
        url: "/users/teachers",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetTeachersQuery } = teacherApi;
