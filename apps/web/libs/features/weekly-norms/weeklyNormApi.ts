import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CustomResponse } from "@web/libs/common";
import { RootState } from "@web/libs/store";
import { IWeeklyNorm } from "@web/libs/weekly-norm";

export const weeklyNormApi = createApi({
  reducerPath: "weeklyNormApi",
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
    getWeeklyNorms: builder.query<
      CustomResponse<IWeeklyNorm[]>,
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) => ({
        url: "/weekly-norms",
        params: {
          startDate,
          endDate,
        },
      }),
    }),
  }),
});

export const { useGetWeeklyNormsQuery } = weeklyNormApi;
