import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@web/libs/store";
import { getToken } from "@web/libs/tokens";
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
      // Try to get the token from state first, then fall back to localStorage
      const token = (getState() as RootState).auth.accessToken || getToken();
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
    getProfile: builder.query<CustomResponse<IUser>, void>({
      query: () => ({
        url: "/auth/my-profile",
        method: "GET",
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

export const {
  useLoginMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
