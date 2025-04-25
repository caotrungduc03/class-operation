import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CustomResponse, Pagination } from "@web/libs/common";
import { CreateCourseDto, ICourse } from "@web/libs/course";
import { RootState } from "@web/libs/store";

export const courseApi = createApi({
  reducerPath: "courseApi",
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
    getCourses: builder.query<
      CustomResponse<Pagination<ICourse[]>>,
      { search?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/courses",
        method: "GET",
        params,
      }),
    }),

    createCourse: builder.mutation<CustomResponse<ICourse>, CreateCourseDto>({
      query: (body) => ({
        url: "/courses",
        method: "POST",
        body,
      }),
    }),

    updateCourse: builder.mutation<
      CustomResponse<ICourse>,
      { id: string; data: CreateCourseDto }
    >({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    deleteCourse: builder.mutation<CustomResponse<void>, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
    }),

    getCourseById: builder.query<CustomResponse<ICourse>, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCourseByIdQuery,
  useLazyGetCourseByIdQuery,
} = courseApi;
