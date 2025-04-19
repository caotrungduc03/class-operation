import { createSlice } from "@reduxjs/toolkit";
import { IWeeklyNorm } from "@web/libs/weekly-norm";
import { weeklyNormApi } from "./weeklyNormApi";

interface WeeklyNormState {
  norms: IWeeklyNorm[];
  loading: boolean;
}

const initialState: WeeklyNormState = {
  norms: [],
  loading: false,
};

export const weeklyNormSlice = createSlice({
  name: "weeklyNorm",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        weeklyNormApi.endpoints.getWeeklyNorms.matchPending,
        (state) => {
          state.loading = true;
        },
      )
      .addMatcher(
        weeklyNormApi.endpoints.getWeeklyNorms.matchFulfilled,
        (state, { payload }) => {
          state.norms = payload;
          state.loading = false;
        },
      )
      .addMatcher(
        weeklyNormApi.endpoints.getWeeklyNorms.matchRejected,
        (state) => {
          state.loading = false;
        },
      );
  },
});

export default weeklyNormSlice;
