import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./features/auth/authApi";
import { authSlice } from "./features/auth/authSlice";
import layoutSlice from "./features/layout/layoutSlice";
import tableSlice from "./features/table/tableSlice";
import { teacherApi } from "./features/teachers/teacherApi";
import teacherSlice from "./features/teachers/teacherSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      [authApi.reducerPath]: authApi.reducer,
      layout: layoutSlice.reducer,
      table: tableSlice.reducer,
      teacher: teacherSlice.reducer,
      [teacherApi.reducerPath]: teacherApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware, teacherApi.middleware),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
