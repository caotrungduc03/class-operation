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
    toggleCreateModal: (state) => {
      state.isOpenCreateModal = !state.isOpenCreateModal;
    },
    toggleEditModal: (state) => {
      state.isOpenEditModal = !state.isOpenEditModal;
    },
  },
});

export const { toggleCreateModal, toggleEditModal } = tableSlice.actions;
export default tableSlice;
