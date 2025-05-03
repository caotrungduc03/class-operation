import { createApi } from "@reduxjs/toolkit/query/react";
import { CustomResponse } from "@web/libs/common";
import { baseFetchQuery } from "@web/libs/customBaseQuery";
import { IUser } from "@web/libs/user";

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
  baseQuery: baseFetchQuery,
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
