import { createSlice } from "@reduxjs/toolkit";
import { getToken, setToken } from "@web/libs/tokens";
import { IUser } from "@web/types/user";
import { authApi } from "./authApi";

export interface AuthState {
  user: IUser | null;
  accessToken: string;
}

const initialState: AuthState = {
  user: null,
  accessToken: "",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data.user;
          state.accessToken = payload.data.accessToken;
          setToken(payload.data.accessToken);
        },
      )
      .addMatcher(
        authApi.endpoints.getMe.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
          state.accessToken = getToken();
        },
      );
  },
});

export default authSlice;
