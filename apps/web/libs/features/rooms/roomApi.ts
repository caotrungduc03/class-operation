import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CustomResponse, Pagination } from "@web/libs/common";
import { CreateRoomDto, IRoom } from "@web/libs/room";
import { RootState } from "@web/libs/store";

export const roomApi = createApi({
  reducerPath: "roomApi",
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
    getRooms: builder.query<
      CustomResponse<Pagination<IRoom[]>>,
      { search?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/rooms",
        method: "GET",
        params,
      }),
    }),

    createRoom: builder.mutation<CustomResponse<IRoom>, CreateRoomDto>({
      query: (body) => ({
        url: "/rooms",
        method: "POST",
        body,
      }),
    }),

    updateRoom: builder.mutation<
      CustomResponse<IRoom>,
      { id: string; data: CreateRoomDto }
    >({
      query: ({ id, data }) => ({
        url: `/rooms/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    deleteRoom: builder.mutation<CustomResponse<void>, string>({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: "DELETE",
      }),
    }),

    getRoomById: builder.query<CustomResponse<IRoom>, string>({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomByIdQuery,
  useLazyGetRoomByIdQuery,
} = roomApi;
