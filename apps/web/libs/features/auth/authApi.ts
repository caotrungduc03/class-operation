import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@web/libs/store";
import { CustomResponse } from "@web/types/common";
import { IUser } from "@web/types/user";

export interface LoginResponse {
  user: IUser;
  accessToken: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
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
    login: builder.mutation<
      CustomResponse<LoginResponse>,
      { email: string; password: string }
    >({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),
    getMe: builder.query<CustomResponse<any>, { accessToken: string }>({
      query: ({ accessToken }) => ({
        url: "/auth/my-profile",
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    }),
    updateProfile: builder.mutation<
      CustomResponse<IUser>,
      UpdateProfileRequest
    >({
      query: (data) => ({
        url: "/auth/update-profile",
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery, useUpdateProfileMutation } =
  authApi;
