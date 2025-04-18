import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CustomResponse, Pagination } from "@web/libs/common";
import { CreateRequestWeeklyNormDto, IRequest } from "@web/libs/request";
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

    cancelWeeklyNorm: builder.mutation<CustomResponse<IRequest>, string>({
      query: (id) => ({
        url: `/requests/weekly-norms/${id}/cancel`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useGetWeeklyNormsQuery,
  useGetWeeklyNormByIdQuery,
  useLazyGetWeeklyNormByIdQuery,
  useCreateWeeklyNormMutation,
  useUpdateWeeklyNormMutation,
  useCancelWeeklyNormMutation,
} = requestApi;
