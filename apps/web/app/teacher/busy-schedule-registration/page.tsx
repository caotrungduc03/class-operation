"use client";
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDatePicker from "@web/components/common/CustomDatePicker";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTimePicker from "@web/components/common/CustomTimePicker";
import CustomTooltip from "@web/components/common/CustomTooltip";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  TIME_FORMAT,
  TableColumn,
} from "@web/libs/common";
import {
  useCreateBusyScheduleMutation,
  useDeleteBusyScheduleMutation,
  useGetBusySchedulesQuery,
  useLazyGetBusyScheduleByIdQuery,
  useUpdateBusyScheduleMutation,
  useUpdateBusyScheduleStatusMutation,
} from "@web/libs/features/requests/requestApi";
import {
  closeCancelModal,
  closeCreateModal,
  closeDeleteModal,
  closeDetailModal,
  openCancelModal,
  openCreateModal,
  openDeleteModal,
  openDetailModal,
  setEditMode,
  setSelectedItemId,
} from "@web/libs/features/table/tableSlice";
import { NAV_TITLE } from "@web/libs/nav";
import {
  IRequest,
  ISchedule,
  REQUEST_STATUS_TAG,
  RequestAction,
  RequestStatus,
  RequestStatusOptions,
  RequestType,
} from "@web/libs/request";
import { RootState } from "@web/libs/store";
import {
  Card,
  Divider,
  Modal,
  Spin,
  Table,
  TablePaginationConfig,
  Tag,
  Typography,
} from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.BUSY_SCHEDULE_REGISTRATION,
  },
];

const columnsTitles: TableColumn<IRequest>[] = [
  {
    title: "#",
    dataIndex: "index",
  },
  {
    title: "Request Name",
    dataIndex: "name",
  },
  {
    title: "Reason",
    dataIndex: "description",
  },
  {
    title: "Date",
    dataIndex: "schedule",
    render: (schedule: ISchedule) =>
      schedule && dayjs(schedule.startDate).format(DATE_FORMAT),
  },
  {
    title: "Time",
    dataIndex: "schedule",
    render: (schedule: ISchedule) =>
      schedule &&
      `${dayjs(schedule?.startDate).format(TIME_FORMAT)} - ${dayjs(schedule?.endDate).format(TIME_FORMAT)}`,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: RequestStatus) => (
      <Tag color={REQUEST_STATUS_TAG[status]}>{status}</Tag>
    ),
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    render: (date: string) => dayjs(date).format(DATE_TIME_FORMAT),
  },
  {
    title: "",
    dataIndex: "method",
    fixed: "right",
  },
];

const BusyScheduleActions = ({
  record,
  onOpenDetail,
  onStartEdit,
  onOpenCancelModal,
  onOpenDeleteModal,
}: {
  record: IRequest;
  onOpenDetail: (id: string) => void;
  onStartEdit: (id: string) => void;
  onOpenCancelModal: (id: string) => void;
  onOpenDeleteModal: (id: string) => void;
}) => {
  return (
    <CustomDropdown>
      <CustomButton
        type="link"
        title="View"
        icon={<EyeOutlined />}
        onClick={() => onOpenDetail(record.id)}
      />
      {record.status === RequestStatus.PENDING && (
        <CustomButton
          type="link"
          title="Edit"
          icon={<EditOutlined />}
          onClick={() => onStartEdit(record.id)}
        />
      )}
      {record.status === RequestStatus.PENDING && (
        <CustomButton
          type="link"
          title="Delete"
          color="danger"
          icon={<DeleteOutlined />}
          onClick={() => onOpenDeleteModal(record.id)}
        />
      )}
      {record.status === RequestStatus.APPROVED && (
        <CustomButton
          type="link"
          title="Cancel"
          color="danger"
          icon={<StopOutlined />}
          onClick={() => onOpenCancelModal(record.id)}
        />
      )}
    </CustomDropdown>
  );
};

const busyScheduleSchema = z.object({
  name: z.string().min(1, "Request Name is required"),
  description: z.string().min(1, "Reason is required"),
  date: z.any().refine((val) => !!val, "Date is required"),
  startTime: z.any().refine((val) => !!val, "Start time is required"),
  endTime: z.any().refine((val) => !!val, "End time is required"),
});

type BusyScheduleFormValues = z.infer<typeof busyScheduleSchema>;

// Add search form schema
const searchFormSchema = z.object({
  name: z.string().optional(),
  status: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const BusyScheduleRegistration = () => {
  const [searchParams, setSearchParams] = useState<{
    name?: string;
    status?: string;
    page?: number;
    limit?: number;
  }>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultCurrent: 1,
    defaultPageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
  });

  const dispatch = useDispatch();
  const {
    isOpenCreateModal,
    isDetailModalOpen,
    isCancelModalOpen,
    isDeleteModalOpen,
    isEditMode,
    selectedItemId,
  } = useSelector((state: RootState) => state.table);

  const {
    data: busySchedulesData,
    isFetching,
    refetch,
  } = useGetBusySchedulesQuery(searchParams);

  const [fetchBusyScheduleDetail, { data: busyScheduleDetail }] =
    useLazyGetBusyScheduleByIdQuery();

  const [createBusySchedule, { isLoading: isCreating }] =
    useCreateBusyScheduleMutation();
  const [updateBusySchedule, { isLoading: isUpdating }] =
    useUpdateBusyScheduleMutation();
  const [updateBusyScheduleStatus, { isLoading: isCanceling }] =
    useUpdateBusyScheduleStatusMutation();

  const [deleteBusySchedule, { isLoading: isDeleting }] =
    useDeleteBusyScheduleMutation();

  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
  });

  // Update the busyScheduleForm to use zod validation
  const busyScheduleForm = useForm<BusyScheduleFormValues>({
    resolver: zodResolver(busyScheduleSchema),
    defaultValues: {
      name: "",
      description: "",
      date: null, // Initially empty, will be validated by zod on submit
      startTime: null,
      endTime: null,
    },
  });

  const tableColumns = useMemo(() => {
    return columnsTitles.map((item, index) => {
      if (item.dataIndex === "method") {
        return {
          ...item,
          key: index,
          render: (record: IRequest) => (
            <BusyScheduleActions
              record={record}
              onOpenDetail={handleOpenDetail}
              onStartEdit={handleStartEdit}
              onOpenCancelModal={handleOpenCancelModal}
              onOpenDeleteModal={handleOpenDeleteModal}
            />
          ),
        };
      }
      if (item.dataIndex === "name") {
        return {
          ...item,
          key: index,
          render: (name: string, record: IRequest) => (
            <CustomTooltip title={name}>
              <span
                className="cursor-pointer text-blue-500 hover:text-blue-700"
                onClick={() => handleOpenDetail(record.id)}
              >
                {name}
              </span>
            </CustomTooltip>
          ),
        };
      }
      return {
        ...item,
        key: index,
      };
    });
  }, []);

  const { current, pageSize } = pagination;

  const tableData = useMemo(() => {
    return (
      busySchedulesData?.data?.items.map((item, index) => ({
        ...item,
        index: ((current || 1) - 1) * (pageSize || 10) + index + 1,
        method: item,
      })) || []
    );
  }, [busySchedulesData, current, pageSize]);

  useEffect(() => {
    if (busySchedulesData?.data) {
      setPagination((prev) => ({
        ...prev,
        current: busySchedulesData.data.page || prev.current,
        pageSize: busySchedulesData.data.limit || prev.pageSize,
        total: busySchedulesData.data.total || 0,
      }));
    }
  }, [busySchedulesData]);

  const handleStartEdit = async (id: string) => {
    dispatch(setSelectedItemId(id));
    dispatch(setEditMode(true));
    dispatch(closeDetailModal());

    try {
      const response = await fetchBusyScheduleDetail(id).unwrap();
      if (response?.data) {
        // Populate form with fetched data
        busyScheduleForm.setValue("name", response.data.name);
        busyScheduleForm.setValue(
          "description",
          response.data.description || "",
        );

        if (response.data.schedule) {
          busyScheduleForm.setValue(
            "date",
            dayjs(response.data.schedule.startDate),
          );
          busyScheduleForm.setValue(
            "startTime",
            dayjs(response.data.schedule.startDate),
          );
          busyScheduleForm.setValue(
            "endTime",
            dayjs(response.data.schedule.endDate),
          );
        }
      }
      // Open the drawer after data is loaded
      dispatch(openCreateModal());
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const onSubmitSearch = (data: { name?: string; status?: string }) => {
    setSearchParams({
      ...searchParams,
      ...data,
      page: 1,
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
    refetch();
  };

  const handleOpenDetail = (id: string) => {
    dispatch(openDetailModal(id));
    fetchBusyScheduleDetail(id);
  };

  const handleCloseDetail = () => {
    dispatch(closeDetailModal());
  };

  const handleOpenCancelModal = (id: string) => {
    dispatch(openCancelModal(id));
  };

  const handleCancel = async () => {
    if (!selectedItemId) return;

    try {
      await updateBusyScheduleStatus({
        id: selectedItemId,
        action: RequestAction.CANCEL,
      }).unwrap();
      toast.success("Busy schedule request canceled successfully");
      refetch();
      dispatch(closeCancelModal());
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const onSubmitCreate = async (data: BusyScheduleFormValues) => {
    // Create a date object for the selected date
    const selectedDate = data.date.toDate();

    // Create start and end datetime by combining the date with selected times
    const startDateTime = data.startTime.toDate();
    const endDateTime = data.endTime.toDate();

    // Set the date component of startDateTime and endDateTime to match the selected date
    startDateTime.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );
    endDateTime.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    const formattedData = {
      name: data.name,
      description: data.description || "",
      type: RequestType.BUSY_SCHEDULE,
      startDate: startDateTime,
      endDate: endDateTime,
    };

    try {
      if (isEditMode && busyScheduleDetail.data) {
        const res = await updateBusySchedule({
          id: busyScheduleDetail.data.id,
          data: formattedData,
        }).unwrap();
        toast.success(res.message);
      } else {
        const res = await createBusySchedule(formattedData).unwrap();
        toast.success(res.message);
      }
      refetch();
      handleCloseDrawer();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCloseDrawer = () => {
    dispatch(closeCreateModal());
    busyScheduleForm.reset();
    dispatch(setEditMode(false));
    dispatch(setSelectedItemId(null));
  };

  const handlePaginationChange = (newPagination: TablePaginationConfig) => {
    setSearchParams({
      ...searchParams,
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  const handleOpenDeleteModal = (id: string) => {
    dispatch(openDeleteModal(id));
  };

  const handleDelete = async () => {
    if (!selectedItemId) return;

    try {
      await deleteBusySchedule(selectedItemId).unwrap();
      toast.success("Busy schedule request deleted successfully");
      refetch();
      dispatch(closeDeleteModal());
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  return (
    <PageLayout
      breadcrumbs={breadcrumbs}
      title={NAV_TITLE.BUSY_SCHEDULE_REGISTRATION}
    >
      <div id="busy-schedule-container" className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-4">
            <FilterGrid>
              <CustomInput
                control={searchForm.control}
                name="name"
                size="large"
                placeholder="Search by request name"
              />
              <CustomSelect
                control={searchForm.control}
                name="status"
                size="large"
                placeholder="Filter by status"
                options={RequestStatusOptions}
              />
            </FilterGrid>
            <div className="flex justify-between">
              <div className="flex gap-4">
                <CustomButton
                  title="Reset"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                />
                <CustomButton
                  type="primary"
                  title="Search"
                  size="large"
                  icon={<SearchOutlined />}
                  onClick={searchForm.handleSubmit(onSubmitSearch)}
                />
              </div>
              <CustomButton
                type="primary"
                title="Create Busy Schedule Request"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => dispatch(openCreateModal())}
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
      {/* Detail Modal */}
      <Modal
        title="Busy Schedule Request Details"
        open={isDetailModalOpen}
        onCancel={handleCloseDetail}
        footer={[
          <CustomButton
            key="close"
            title="Close"
            icon={<CloseOutlined />}
            onClick={handleCloseDetail}
          />,
          busyScheduleDetail?.data?.status === RequestStatus.PENDING && (
            <CustomButton
              key="edit"
              type="primary"
              title="Edit"
              icon={<EditOutlined />}
              onClick={() => handleStartEdit(busyScheduleDetail.data.id)}
            />
          ),
        ]}
        width={800}
      >
        {busyScheduleDetail ? (
          <div className="flex flex-col gap-4">
            <div>
              <Typography.Text type="secondary">Request Name:</Typography.Text>
              <Typography.Title level={5} className="mt-1">
                {busyScheduleDetail.data.name}
              </Typography.Title>
            </div>

            <div>
              <Typography.Text type="secondary">Reason:</Typography.Text>
              <Typography.Paragraph className="mt-1">
                {busyScheduleDetail.data.description || ""}
              </Typography.Paragraph>
            </div>

            <div>
              <Typography.Text type="secondary">Status:</Typography.Text>
              <span className="ml-2">
                <Tag color={REQUEST_STATUS_TAG[busyScheduleDetail.data.status]}>
                  {busyScheduleDetail.data.status}
                </Tag>
              </span>
            </div>

            <Divider orientation="left">Busy Schedule Details</Divider>

            {busyScheduleDetail.data?.schedule && (
              <Card size="small" className="mb-4">
                <div className="flex flex-col gap-2">
                  <div>
                    <Typography.Text type="secondary">Date:</Typography.Text>
                    <Typography.Text className="ml-2">
                      {dayjs(busyScheduleDetail.data.schedule.startDate).format(
                        DATE_FORMAT,
                      )}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text type="secondary">Time:</Typography.Text>
                    <Typography.Text className="ml-2">
                      {dayjs(busyScheduleDetail.data.schedule.startDate).format(
                        TIME_FORMAT,
                      )}{" "}
                      -{" "}
                      {dayjs(busyScheduleDetail.data.schedule.endDate).format(
                        TIME_FORMAT,
                      )}
                    </Typography.Text>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-between">
              <div>
                <Typography.Text type="secondary">Created At:</Typography.Text>
                <Typography.Text className="ml-2">
                  {dayjs(busyScheduleDetail.data.createdAt).format(
                    DATE_TIME_FORMAT,
                  )}
                </Typography.Text>
              </div>

              <div>
                <Typography.Text type="secondary">Updated At:</Typography.Text>
                <Typography.Text className="ml-2">
                  {dayjs(busyScheduleDetail.data.updatedAt).format(
                    DATE_TIME_FORMAT,
                  )}
                </Typography.Text>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-10">
            <Spin size="large" />
          </div>
        )}
      </Modal>
      {/* Create/Edit Drawer - Notice there's no field array or add/remove buttons */}
      <CustomDrawer
        title={
          isEditMode
            ? "Edit Busy Schedule Request"
            : "Create Busy Schedule Request"
        }
        open={isOpenCreateModal}
        onCancel={handleCloseDrawer}
        onSubmit={busyScheduleForm.handleSubmit(onSubmitCreate)}
        loading={isCreating || isUpdating}
      >
        <div className="flex flex-col gap-4">
          <CustomInput
            control={busyScheduleForm.control}
            name="name"
            label="Request Name"
            placeholder="Enter request name"
            size="large"
            required
          />

          <CustomInput
            control={busyScheduleForm.control}
            name="description"
            label="Reason"
            placeholder="Enter reason for busy schedule"
            size="large"
            required
          />

          <Divider orientation="left">Busy Schedule Details</Divider>

          <div className="flex flex-col gap-2">
            <CustomDatePicker
              control={busyScheduleForm.control}
              name="date"
              label="Date"
              size="large"
              placeholder="Select date"
              required
            />
          </div>

          <div className="flex gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <CustomTimePicker
                control={busyScheduleForm.control}
                name="startTime"
                label="Start Time"
                size="large"
                placeholder="Start time"
                required
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <CustomTimePicker
                control={busyScheduleForm.control}
                name="endTime"
                label="End Time"
                size="large"
                format="HH:mm"
                placeholder="End time"
                required
              />
            </div>
          </div>
        </div>
      </CustomDrawer>
      {/* Cancel Confirmation Modal */}
      <Modal
        title="Cancel Busy Schedule Request"
        open={isCancelModalOpen}
        onCancel={() => dispatch(closeCancelModal())}
        footer={[
          <CustomButton
            key="back"
            title="No, Keep It"
            onClick={() => dispatch(closeCancelModal())}
          />,
          <CustomButton
            key="submit"
            type="primary"
            color="danger"
            title="Yes, Cancel Request"
            loading={isCanceling}
            onClick={handleCancel}
          />,
        ]}
      >
        <Typography.Paragraph>
          Are you sure you want to cancel this busy schedule request? This
          action cannot be undone.
        </Typography.Paragraph>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Busy Schedule Request"
        open={isDeleteModalOpen}
        onCancel={() => dispatch(closeDeleteModal())}
        footer={[
          <CustomButton
            key="back"
            title="No, Keep It"
            onClick={() => dispatch(closeDeleteModal())}
          />,
          <CustomButton
            key="submit"
            type="primary"
            color="danger"
            title="Yes, Delete Request"
            loading={isDeleting}
            onClick={handleDelete}
          />,
        ]}
      >
        <Typography.Paragraph>
          Are you sure you want to delete this busy schedule request? This
          action cannot be undone.
        </Typography.Paragraph>
      </Modal>
    </PageLayout>
  );
};

export default BusyScheduleRegistration;
