import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TableState {
  isOpenCreateModal: boolean;
  isOpenEditModal: boolean;
  isDetailModalOpen: boolean;
  isCancelModalOpen: boolean;
  isEditMode: boolean;
  selectedItemId: string | null;
}

const initialState: TableState = {
  isOpenCreateModal: false,
  isOpenEditModal: false,
  isDetailModalOpen: false,
  isCancelModalOpen: false,
  isEditMode: false,
  selectedItemId: null,
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
      state.isEditMode = false;
    },
    openEditModal: (state) => {
      state.isOpenEditModal = true;
    },
    closeEditModal: (state) => {
      state.isOpenEditModal = false;
    },
    openDetailModal: (state, action: PayloadAction<string>) => {
      state.isDetailModalOpen = true;
      state.selectedItemId = action.payload;
    },
    closeDetailModal: (state) => {
      state.isDetailModalOpen = false;
      state.selectedItemId = null;
    },
    openCancelModal: (state, action: PayloadAction<string>) => {
      state.isCancelModalOpen = true;
      state.selectedItemId = action.payload;
    },
    closeCancelModal: (state) => {
      state.isCancelModalOpen = false;
      state.selectedItemId = null;
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
    },
    setSelectedItemId: (state, action: PayloadAction<string | null>) => {
      state.selectedItemId = action.payload;
    },
  },
});

export const {
  openCreateModal,
  openEditModal,
  closeCreateModal,
  closeEditModal,
  openDetailModal,
  closeDetailModal,
  openCancelModal,
  closeCancelModal,
  setEditMode,
  setSelectedItemId,
} = tableSlice.actions;
export default tableSlice;
