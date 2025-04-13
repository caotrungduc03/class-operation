import { createSlice } from "@reduxjs/toolkit";
import { IUser } from "@web/types/user";
import { userApi } from "./userApi";

export interface AuthState {
  teachers: IUser[];
}

const initialState: AuthState = {
  teachers: [],
};

export const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      userApi.endpoints.getTeachers.matchFulfilled,
      (state, { payload }) => {
        state.teachers = payload.data.items;
      },
    );
  },
});

export default teacherSlice;
