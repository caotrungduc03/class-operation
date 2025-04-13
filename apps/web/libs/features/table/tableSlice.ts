import { createSlice } from "@reduxjs/toolkit";

export interface TableState {
  isOpenCreateModal: boolean;
  isOpenEditModal: boolean;
}

const initialState: TableState = {
  isOpenCreateModal: false,
  isOpenEditModal: false,
};

export const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    openCreateModal: (state) => {
      state.isOpenCreateModal = true;
    },
    closeCreateModal: (state) => {
      state.isOpenCreateModal = false;
    },
    openEditModal: (state) => {
      state.isOpenEditModal = true;
    },
    closeEditModal: (state) => {
      state.isOpenEditModal = false;
    },
  },
});

export const {
  openCreateModal,
  openEditModal,
  closeCreateModal,
  closeEditModal,
} = tableSlice.actions;
export default tableSlice;
