import { createSlice } from "@reduxjs/toolkit";
import { IRequest } from "@web/libs/request";
import { requestApi } from "./requestApi";

export interface RequestState {
  weeklyNorms: IRequest[];
  selectedWeeklyNorm: IRequest | null;
  timeOffs: IRequest[];
  selectedTimeOff: IRequest | null;
}

const initialState: RequestState = {
  weeklyNorms: [],
  selectedWeeklyNorm: null,
  timeOffs: [],
  selectedTimeOff: null,
};

export const requestSlice = createSlice({
  name: "request",
  initialState,
  reducers: {
    clearSelectedWeeklyNorm: (state) => {
      state.selectedWeeklyNorm = null;
    },
    clearSelectedTimeOff: (state) => {
      state.selectedTimeOff = null;
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

    // Time Off reducers
    builder.addMatcher(
      requestApi.endpoints.getTimeOffs.matchFulfilled,
      (state, { payload }) => {
        state.timeOffs = payload.data.items;
      },
    );

    builder.addMatcher(
      requestApi.endpoints.getTimeOffById.matchFulfilled,
      (state, { payload }) => {
        state.selectedTimeOff = payload.data;
      },
    );

    builder.addMatcher(
      requestApi.endpoints.createTimeOff.matchFulfilled,
      (state, { payload }) => {
        state.timeOffs = [payload.data, ...state.timeOffs];
      },
    );

    builder.addMatcher(
      requestApi.endpoints.updateTimeOff.matchFulfilled,
      (state, { payload }) => {
        state.selectedTimeOff = payload.data;
        state.timeOffs = state.timeOffs.map((request) =>
          request.id === payload.data.id ? payload.data : request,
        );
      },
    );

    builder.addMatcher(
      requestApi.endpoints.updateTimeOffStatus.matchFulfilled,
      (state, { payload }) => {
        state.selectedTimeOff = payload.data;
        state.timeOffs = state.timeOffs.map((request) =>
          request.id === payload.data.id ? payload.data : request,
        );
      },
    );
  },
});

export const { clearSelectedWeeklyNorm, clearSelectedTimeOff } =
  requestSlice.actions;

export default requestSlice;
