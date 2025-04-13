import { configureStore } from "@reduxjs/toolkit";
import { apiErrorMiddleware } from "./apiErrorMiddleware";
import { authApi } from "./features/auth/authApi";
import { authSlice } from "./features/auth/authSlice";
import layoutSlice from "./features/layout/layoutSlice";
import tableSlice from "./features/table/tableSlice";
import { userApi } from "./features/users/userApi";
import userSlice from "./features/users/userSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      [authApi.reducerPath]: authApi.reducer,
      layout: layoutSlice.reducer,
      table: tableSlice.reducer,
      user: userSlice.reducer,
      [userApi.reducerPath]: userApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(authApi.middleware, userApi.middleware)
        .concat(apiErrorMiddleware),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
