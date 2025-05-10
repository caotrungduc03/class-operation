import { createApi } from "@reduxjs/toolkit/query/react";
import { CustomResponse } from "@web/libs/common";
import { baseFetchQuery } from "@web/libs/customBaseQuery";
import { CreateTeachingScheduleDto, ISchedule } from "@web/libs/schedule";

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
    createSchedule: builder.mutation<
      CustomResponse<ISchedule[]>,
      CreateTeachingScheduleDto
    >({
      query: (data) => {
        return {
          url: "/schedules/teaching",
          method: "POST",
          body: data,
        };
      },
    }),
    deleteSchedule: builder.mutation<CustomResponse<any>, string>({
      query: (id) => ({
        url: `/schedules/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
} = scheduleApi;
