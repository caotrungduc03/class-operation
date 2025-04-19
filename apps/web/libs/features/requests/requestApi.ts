import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CustomResponse, Pagination } from "@web/libs/common";
import {
  CreateRequestTimeOffDto,
  CreateRequestWeeklyNormDto,
  IRequest,
  RequestAction,
} from "@web/libs/request";
import { RootState } from "@web/libs/store";

export const requestApi = createApi({
  reducerPath: "requestApi",
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
    // Weekly Norm endpoints
    getWeeklyNorms: builder.query<
      CustomResponse<Pagination<IRequest[]>>,
      { search?: string; status?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/requests/weekly-norms",
        method: "GET",
        params,
      }),
    }),

    getWeeklyNormById: builder.query<CustomResponse<IRequest>, string>({
      query: (id) => ({
        url: `/requests/weekly-norms/${id}`,
        method: "GET",
      }),
    }),

    createWeeklyNorm: builder.mutation<
      CustomResponse<IRequest>,
      CreateRequestWeeklyNormDto
    >({
      query: (body) => ({
        url: "/requests/weekly-norms",
        method: "POST",
        body,
      }),
    }),

    updateWeeklyNorm: builder.mutation<
      CustomResponse<IRequest>,
      { id: string; data: Partial<CreateRequestWeeklyNormDto> }
    >({
      query: ({ id, data }) => ({
        url: `/requests/weekly-norms/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    updateWeeklyNormStatus: builder.mutation<
      CustomResponse<IRequest>,
      { id: string; action: RequestAction }
    >({
      query: ({ id, action }) => ({
        url: `/requests/weekly-norms/${id}/update-status`,
        method: "PATCH",
        body: { action },
      }),
    }),

    // Time Off endpoints
    getTimeOffs: builder.query<
      CustomResponse<Pagination<IRequest[]>>,
      { search?: string; status?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/requests/time-offs",
        method: "GET",
        params,
      }),
    }),

    getTimeOffById: builder.query<CustomResponse<IRequest>, string>({
      query: (id) => ({
        url: `/requests/time-offs/${id}`,
        method: "GET",
      }),
    }),

    createTimeOff: builder.mutation<
      CustomResponse<IRequest>,
      CreateRequestTimeOffDto
    >({
      query: (body) => ({
        url: "/requests/time-offs",
        method: "POST",
        body,
      }),
    }),

    updateTimeOff: builder.mutation<
      CustomResponse<IRequest>,
      { id: string; data: Partial<CreateRequestTimeOffDto> }
    >({
      query: ({ id, data }) => ({
        url: `/requests/time-offs/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    updateTimeOffStatus: builder.mutation<
      CustomResponse<IRequest>,
      { id: string; action: RequestAction }
    >({
      query: ({ id, action }) => ({
        url: `/requests/time-offs/${id}/update-status`,
        method: "PATCH",
        body: { action },
      }),
    }),
  }),
});

export const {
  // Weekly Norm hooks
  useGetWeeklyNormsQuery,
  useGetWeeklyNormByIdQuery,
  useLazyGetWeeklyNormByIdQuery,
  useCreateWeeklyNormMutation,
  useUpdateWeeklyNormMutation,
  useUpdateWeeklyNormStatusMutation,

  // Time Off hooks
  useGetTimeOffsQuery,
  useGetTimeOffByIdQuery,
  useLazyGetTimeOffByIdQuery,
  useCreateTimeOffMutation,
  useUpdateTimeOffMutation,
  useUpdateTimeOffStatusMutation,
} = requestApi;
