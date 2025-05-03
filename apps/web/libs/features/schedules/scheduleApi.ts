import { createApi } from "@reduxjs/toolkit/query/react";
import { CustomResponse } from "@web/libs/common";
import { baseFetchQuery } from "@web/libs/customBaseQuery";
import { ISchedule } from "@web/libs/schedule";

export const scheduleApi = createApi({
  reducerPath: "scheduleApi",
  baseQuery: baseFetchQuery,
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
