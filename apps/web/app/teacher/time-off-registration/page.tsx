"use client";
import { PlusOutlined } from "@ant-design/icons";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  TIME_FORMAT,
  TableColumn,
} from "@web/libs/common";
import {
  useCreateTimeOffMutation,
  useGetTimeOffsQuery,
  useLazyGetTimeOffByIdQuery,
  useUpdateTimeOffMutation,
  useUpdateTimeOffStatusMutation,
} from "@web/libs/features/requests/requestApi";
import {
  closeCancelModal,
  closeCreateModal,
  closeDetailModal,
  openCancelModal,
  openCreateModal,
  openDetailModal,
  setEditMode,
  setSelectedItemId,
} from "@web/libs/features/table/tableSlice";
import {
  IRequest,
  ITimeOff,
  REQUEST_STATUS_TAG,
  RequestAction,
  RequestStatus,
  RequestStatusOptions,
  RequestType,
} from "@web/libs/request";
import { RootState } from "@web/libs/store";
import {
  Card,
  DatePicker,
  Divider,
  Modal,
  Spin,
  Table,
  TablePaginationConfig,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const breadcrumbs: ItemType[] = [
  {
    href: "#",
    title: "TEACHER",
  },
  {
    title: "Time Off Requests",
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
    title: "Description",
    dataIndex: "description",
  },
  {
    title: "Date",
    dataIndex: "timeOff",
    render: (timeOff: ITimeOff) => dayjs(timeOff?.date).format(DATE_FORMAT),
  },
  {
    title: "Time",
    dataIndex: "timeOff",
    render: (timeOff: ITimeOff) =>
      `${dayjs(timeOff?.startTime).format(TIME_FORMAT)} - ${dayjs(timeOff?.endTime).format(TIME_FORMAT)}`,
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

const TimeOffActions = ({
  record,
  onOpenDetail,
  onStartEdit,
  onOpenCancelModal,
}: {
  record: IRequest;
  onOpenDetail: (id: string) => void;
  onStartEdit: (id: string) => void;
  onOpenCancelModal: (id: string) => void;
}) => {
  return (
    <CustomDropdown>
      <CustomButton
        type="link"
        title="View"
        onClick={() => onOpenDetail(record.id)}
      />
      {record.status === RequestStatus.PENDING && (
        <CustomButton
          type="link"
          title="Edit"
          onClick={() => onStartEdit(record.id)}
        />
      )}
      {record.status === RequestStatus.APPROVED && (
        <CustomButton
          type="link"
          title="Cancel"
          color="danger"
          onClick={() => onOpenCancelModal(record.id)}
        />
      )}
    </CustomDropdown>
  );
};

const TimeOffRegistration = () => {
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
    isEditMode,
    selectedItemId,
  } = useSelector((state: RootState) => state.table);

  const {
    data: timeOffsData,
    isFetching,
    refetch,
  } = useGetTimeOffsQuery(searchParams);

  const [fetchTimeOffDetail, { data: timeOffDetail }] =
    useLazyGetTimeOffByIdQuery();

  const [createTimeOff, { isLoading: isCreating }] = useCreateTimeOffMutation();
  const [updateTimeOff, { isLoading: isUpdating }] = useUpdateTimeOffMutation();
  const [updateTimeOffStatus, { isLoading: isCanceling }] =
    useUpdateTimeOffStatusMutation();

  const searchForm = useForm();

  // Time off form has single date/time fields (not an array like weekly norm)
  const timeOffForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      date: null, // Single date field
      startTime: null, // Single start time
      endTime: null, // Single end time
    },
  });

  const tableColumns = columnsTitles.map((item, index) => {
    if (item.dataIndex === "method") {
      return {
        ...item,
        key: index,
        render: (record: IRequest) => (
          <TimeOffActions
            record={record}
            onOpenDetail={handleOpenDetail}
            onStartEdit={handleStartEdit}
            onOpenCancelModal={handleOpenCancelModal}
          />
        ),
      };
    }
    return {
      ...item,
      key: index,
    };
  });

  const { current, pageSize } = pagination;

  const tableData = useMemo(() => {
    return (
      timeOffsData?.data?.items.map((item, index) => ({
        ...item,
        index: ((current || 1) - 1) * (pageSize || 10) + index + 1,
        method: item,
      })) || []
    );
  }, [timeOffsData, current, pageSize]);

  useEffect(() => {
    if (timeOffsData?.data) {
      setPagination((prev) => ({
        ...prev,
        current: timeOffsData.data.page || prev.current,
        pageSize: timeOffsData.data.limit || prev.pageSize,
        total: timeOffsData.data.total || 0,
      }));
    }
  }, [timeOffsData]);

  const handleStartEdit = async (id: string) => {
    dispatch(setSelectedItemId(id));
    dispatch(setEditMode(true));
    dispatch(closeDetailModal());

    try {
      const response = await fetchTimeOffDetail(id).unwrap();
      if (response?.data) {
        // Populate form with fetched data
        timeOffForm.setValue("name", response.data.name);
        timeOffForm.setValue("description", response.data.description || "");

        if (response.data.timeOff) {
          timeOffForm.setValue("date", dayjs(response.data.timeOff.date));
          timeOffForm.setValue(
            "startTime",
            dayjs(response.data.timeOff.startTime),
          );
          timeOffForm.setValue("endTime", dayjs(response.data.timeOff.endTime));
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
  };

  const handleOpenDetail = (id: string) => {
    dispatch(openDetailModal(id));
    fetchTimeOffDetail(id);
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
      await updateTimeOffStatus({
        id: selectedItemId,
        action: RequestAction.CANCEL,
      }).unwrap();
      toast.success("Time off request canceled successfully");
      refetch();
      dispatch(closeCancelModal());
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const onSubmitCreate = async (data) => {
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
      type: RequestType.TIME_OFF,
      startDate: startDateTime,
      endDate: endDateTime,
    };

    try {
      if (isEditMode && selectedItemId) {
        const res = await updateTimeOff({
          id: selectedItemId,
          data: formattedData,
        }).unwrap();
        toast.success(res.message);
      } else {
        const res = await createTimeOff(formattedData).unwrap();
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
    timeOffForm.reset();
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

  return (
    <PageLayout breadcrumbs={breadcrumbs} title="Time Off Requests">
      <div id="time-off-container" className="flex flex-col gap-6">
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
                title="Create Time Off Request"
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
        title="Time Off Request Details"
        open={isDetailModalOpen}
        onCancel={handleCloseDetail}
        footer={[
          <CustomButton
            key="close"
            title="Close"
            onClick={handleCloseDetail}
          />,
          timeOffDetail?.data?.status === RequestStatus.PENDING && (
            <CustomButton
              key="edit"
              type="primary"
              title="Edit"
              onClick={() => handleStartEdit(timeOffDetail.data.id)}
            />
          ),
        ]}
        width={800}
      >
        {timeOffDetail ? (
          <div className="flex flex-col gap-4">
            <div>
              <Typography.Text type="secondary">Request Name:</Typography.Text>
              <Typography.Title level={5} className="mt-1">
                {timeOffDetail.data.name}
              </Typography.Title>
            </div>

            <div>
              <Typography.Text type="secondary">Description:</Typography.Text>
              <Typography.Paragraph className="mt-1">
                {timeOffDetail.data.description || ""}
              </Typography.Paragraph>
            </div>

            <div>
              <Typography.Text type="secondary">Status:</Typography.Text>
              <span className="ml-2">
                <Tag color={REQUEST_STATUS_TAG[timeOffDetail.data.status]}>
                  {timeOffDetail.data.status}
                </Tag>
              </span>
            </div>

            <Divider orientation="left">Time Off Details</Divider>

            {timeOffDetail.data.timeOff && (
              <Card size="small" className="mb-4">
                <div className="flex flex-col gap-2">
                  <div>
                    <Typography.Text type="secondary">Date:</Typography.Text>
                    <Typography.Text className="ml-2">
                      {dayjs(timeOffDetail.data.timeOff.date).format(
                        DATE_FORMAT,
                      )}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text type="secondary">Time:</Typography.Text>
                    <Typography.Text className="ml-2">
                      {dayjs(timeOffDetail.data.timeOff.startTime).format(
                        TIME_FORMAT,
                      )}{" "}
                      -{" "}
                      {dayjs(timeOffDetail.data.timeOff.endTime).format(
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
                  {dayjs(timeOffDetail.data.createdAt).format(DATE_TIME_FORMAT)}
                </Typography.Text>
              </div>

              <div>
                <Typography.Text type="secondary">Updated At:</Typography.Text>
                <Typography.Text className="ml-2">
                  {dayjs(timeOffDetail.data.updatedAt).format(DATE_TIME_FORMAT)}
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
        title={isEditMode ? "Edit Time Off Request" : "Create Time Off Request"}
        open={isOpenCreateModal}
        onCancel={handleCloseDrawer}
        onSubmit={timeOffForm.handleSubmit(onSubmitCreate)}
        loading={isCreating || isUpdating}
      >
        <div className="flex flex-col gap-4">
          <CustomInput
            control={timeOffForm.control}
            name="name"
            label="Request Name"
            placeholder="Enter request name"
            size="large"
            required
          />

          <CustomInput
            control={timeOffForm.control}
            name="description"
            label="Description"
            placeholder="Enter description (optional)"
            size="large"
          />

          <Divider orientation="left">Time Off Details</Divider>

          {/* Single date picker (not a repeatable field) */}
          <div className="flex flex-col gap-2">
            <Typography.Text>Date</Typography.Text>
            <DatePicker
              style={{ width: "100%" }}
              size="large"
              value={timeOffForm.watch("date")}
              onChange={(date) => timeOffForm.setValue("date", date)}
              placeholder="Select date"
            />
          </div>

          {/* Single time range (not repeatable) */}
          <div className="flex gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <Typography.Text>Start Time</Typography.Text>
              <TimePicker
                style={{ width: "100%" }}
                size="large"
                format="HH:mm"
                value={timeOffForm.watch("startTime")}
                onChange={(time) => timeOffForm.setValue("startTime", time)}
                placeholder="Start time"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Typography.Text>End Time</Typography.Text>
              <TimePicker
                style={{ width: "100%" }}
                size="large"
                format="HH:mm"
                value={timeOffForm.watch("endTime")}
                onChange={(time) => timeOffForm.setValue("endTime", time)}
                placeholder="End time"
              />
            </div>
          </div>
        </div>
      </CustomDrawer>
      {/* Cancel Confirmation Modal */}
      <Modal
        title="Cancel Time Off Request"
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
          Are you sure you want to cancel this time off request? This action
          cannot be undone.
        </Typography.Paragraph>
      </Modal>
    </PageLayout>
  );
};

export default TimeOffRegistration;
