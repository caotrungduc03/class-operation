import { createSlice } from "@reduxjs/toolkit";
import { IRequest } from "@web/libs/request";
import { requestApi } from "./requestApi";

export interface RequestState {
  weeklyNorms: IRequest[];
  selectedWeeklyNorm: IRequest | null;
}

const initialState: RequestState = {
  weeklyNorms: [],
  selectedWeeklyNorm: null,
};

export const requestSlice = createSlice({
  name: "request",
  initialState,
  reducers: {
    clearSelectedWeeklyNorm: (state) => {
      state.selectedWeeklyNorm = null;
    },
  },
  extraReducers: (builder) => {
    // Weekly Norm reducers
    builder.addMatcher(
      requestApi.endpoints.getWeeklyNorms.matchFulfilled,
      (state, { payload }) => {
        state.weeklyNorms = payload.data.items;
      },
    );

    builder.addMatcher(
      requestApi.endpoints.getWeeklyNormById.matchFulfilled,
      (state, { payload }) => {
        state.selectedWeeklyNorm = payload.data;
      },
    );

    builder.addMatcher(
      requestApi.endpoints.createWeeklyNorm.matchFulfilled,
      (state, { payload }) => {
        state.weeklyNorms = [payload.data, ...state.weeklyNorms];
      },
    );

    builder.addMatcher(
      requestApi.endpoints.updateWeeklyNorm.matchFulfilled,
      (state, { payload }) => {
        state.selectedWeeklyNorm = payload.data;
        state.weeklyNorms = state.weeklyNorms.map((request) =>
          request.id === payload.data.id ? payload.data : request,
        );
      },
    );

    builder.addMatcher(
      requestApi.endpoints.updateWeeklyNormStatus.matchFulfilled,
      (state, { payload }) => {
        state.selectedWeeklyNorm = payload.data;
        state.weeklyNorms = state.weeklyNorms.map((request) =>
          request.id === payload.data.id ? payload.data : request,
        );
      },
    );
  },
});

export const { clearSelectedWeeklyNorm } = requestSlice.actions;

export default requestSlice;
