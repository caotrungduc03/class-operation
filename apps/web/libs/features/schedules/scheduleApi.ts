import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CustomResponse } from "@web/libs/common";
import { ISchedule } from "@web/libs/schedule";
import { RootState } from "@web/libs/store";

export const scheduleApi = createApi({
  reducerPath: "scheduleApi",
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
    getSchedules: builder.query<
      CustomResponse<ISchedule[]>,
      {
        startDate: string;
        endDate: string;
        teacherId?: string;
      }
    >({
      query: (params) => ({
        url: "/schedules",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetSchedulesQuery } = scheduleApi;
