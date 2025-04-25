"use client";
import { PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomInputNumber from "@web/components/common/CustomInputNumber";
import CustomTextArea from "@web/components/common/CustomTextArea";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import { TableColumn } from "@web/libs/common";
import {
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomsQuery,
  useLazyGetRoomByIdQuery,
  useUpdateRoomMutation,
} from "@web/libs/features/rooms/roomApi";
import {
  closeCreateModal,
  openCreateModal,
} from "@web/libs/features/table/tableSlice";
import { NAV_TITLE } from "@web/libs/nav";
import { CreateRoomDto, IRoom } from "@web/libs/room";
import { RootState } from "@web/libs/store";
import { Card, Modal, Table, TablePaginationConfig } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.MANAGE_ROOMS,
  },
];

const columnsTitles: TableColumn<IRoom>[] = [
  {
    title: "#",
    dataIndex: "index",
  },
  {
    title: "Code",
    dataIndex: "code",
  },
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
  },
  {
    title: "Location",
    dataIndex: "location",
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: boolean) => (status ? "Active" : "Inactive"),
  },
  {
    title: "Created Date",
    dataIndex: "createdAt",
    render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm:ss"),
  },
  {
    title: "Updated Date",
    dataIndex: "updatedAt",
    render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm:ss"),
  },
  {
    title: "",
    dataIndex: "method",
    fixed: "right",
  },
];

// Define Zod schema for room form validation
const roomFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.number().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.boolean().optional().default(true),
});

// Create type from Zod schema and ensure it matches CreateRoomDto
type RoomFormValues = z.infer<typeof roomFormSchema>;

const RoomActions = ({
  record,
  onEdit,
  onDelete,
}: {
  record: IRoom;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <CustomDropdown>
      <CustomButton
        type="link"
        title="Edit"
        onClick={() => onEdit(record.id)}
      />
      <CustomButton
        type="link"
        title="Delete"
        color="danger"
        onClick={() => onDelete(record.id)}
      />
    </CustomDropdown>
  );
};

const Rooms = () => {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultCurrent: 1,
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [searchParams, setSearchParams] = useState<{
    name?: string;
    page?: number;
    limit?: number;
  }>({
    page: 1,
    limit: 10,
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { isOpenCreateModal } = useSelector((state: RootState) => state.table);
  const dispatch = useDispatch();

  // Search form
  const searchForm = useForm();

  // Room form with validation
  const roomForm = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: "",
      quantity: undefined,
      location: "",
      description: "",
      status: true,
    },
  });

  const { data, isFetching, refetch } = useGetRoomsQuery(searchParams);
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

  // Use the lazy version of the query
  const [getRoomById, { isFetching: isLoadingRoom }] =
    useLazyGetRoomByIdQuery();

  const { current, pageSize } = pagination;

  const tableColumns = useMemo(() => {
    return columnsTitles.map((item, index) => {
      if (item.dataIndex === "method") {
        return {
          ...item,
          render: (record: IRoom) => {
            return (
              <RoomActions
                record={record}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
              />
            );
          },
          key: index,
        };
      }
      return {
        ...item,
        key: index,
      };
    });
  }, []);

  const tableData = useMemo(() => {
    return (
      data?.data?.items.map((item, index) => ({
        ...item,
        index: ((current || 1) - 1) * (pageSize || 10) + index + 1,
        method: item,
      })) || []
    );
  }, [data, current, pageSize]);

  const onSubmitSearch = (formData: { name?: string }) => {
    setSearchParams({
      ...searchParams,
      name: formData.name,
      page: 1, // Reset to first page on new name
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleReset = () => {
    searchForm.reset();
    setSearchParams({
      page: 1,
      limit: pagination.pageSize || 10,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleEditRoom = (id: string) => {
    setSelectedRoomId(id);
    setIsEditMode(true);

    // Use the lazy query to get room data
    getRoomById(id)
      .unwrap()
      .then((response) => {
        if (response?.data) {
          const room = response.data;
          roomForm.reset({
            name: room.name,
            quantity: room.quantity,
            location: room.location,
            description: room.description,
            status: room.status,
          });
          dispatch(openCreateModal());
        }
      })
      .catch((error) => {
        // Error handling
      });
  };

  const handleDeleteRoom = (id: string) => {
    Modal.confirm({
      title: "Delete Room",
      content: "Are you sure you want to delete this room?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteRoom(id).unwrap();
          toast.success("Room deleted successfully");
          refetch();
        } catch (error) {
          // Handled by the apiErrorMiddleware
        }
      },
    });
  };

  const onSubmitRoom = async (formData: RoomFormValues) => {
    try {
      // Convert formData to match the CreateRoomDto structure
      const roomData: CreateRoomDto = {
        name: formData.name,
        quantity: formData.quantity,
        location: formData.location,
        description: formData.description,
        status: formData.status,
      };

      if (isEditMode && selectedRoomId) {
        await updateRoom({ id: selectedRoomId, data: roomData }).unwrap();
        toast.success("Room updated successfully");
      } else {
        await createRoom(roomData).unwrap();
        toast.success("Room created successfully");
      }
      handleCloseDrawer();
      refetch();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCloseDrawer = () => {
    dispatch(closeCreateModal());
    roomForm.reset();
    setIsEditMode(false);
    setSelectedRoomId(null);
  };

  const handlePaginationChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
    setSearchParams({
      ...searchParams,
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  const handleAddRoom = () => {
    setIsEditMode(false);
    roomForm.reset({
      name: "",
      quantity: undefined,
      location: "",
      description: "",
      status: true,
    });
    dispatch(openCreateModal());
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MANAGE_ROOMS}>
      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-4">
            <FilterGrid>
              <CustomInput
                control={searchForm.control}
                name="name"
                size="large"
                placeholder="Search by name or code"
              />
            </FilterGrid>
            <div className="flex justify-between">
              <div className="flex gap-4">
                <CustomButton
                  title="Reset"
                  size="large"
                  onClick={handleReset}
                />
                <CustomButton
                  type="primary"
                  title="Search"
                  size="large"
                  onClick={searchForm.handleSubmit(onSubmitSearch)}
                />
              </div>
              <CustomButton
                type="primary"
                title="Add Room"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAddRoom}
              />
            </div>
          </div>
        </Card>
        <Card>
          <Table
            loading={isFetching}
            rowKey={(record) => record.id}
            columns={tableColumns}
            dataSource={tableData}
            scroll={{ x: "max-content" }}
            pagination={pagination}
            onChange={handlePaginationChange}
          />
        </Card>
      </div>

      <CustomDrawer
        title={isEditMode ? "Edit Room" : "Add Room"}
        open={isOpenCreateModal}
        onCancel={handleCloseDrawer}
        onSubmit={roomForm.handleSubmit(onSubmitRoom)}
        loading={isCreating || isUpdating || isLoadingRoom}
      >
        <div className="flex flex-col gap-4">
          <CustomInput
            control={roomForm.control}
            name="name"
            label="Room Name"
            placeholder="Enter room name"
            required
          />

          <CustomInputNumber
            control={roomForm.control}
            name="quantity"
            label="Quantity"
            placeholder="Enter room quantity"
          />

          <CustomInput
            control={roomForm.control}
            name="location"
            label="Location"
            placeholder="Enter room location"
          />

          <CustomTextArea
            control={roomForm.control}
            name="description"
            label="Description"
            placeholder="Enter room description"
          />
        </div>
      </CustomDrawer>
    </PageLayout>
  );
};

export default Rooms;
