"use client";
import CustomButton from "@web/components/common/CustomButton";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import { DATE_TIME_FORMAT, TableColumn } from "@web/libs/common";
import {
  useGetBusySchedulesQuery,
  useLazyGetBusyScheduleByIdQuery,
  useUpdateBusyScheduleStatusMutation,
} from "@web/libs/features/requests/requestApi";
import { clearSelectedBusySchedule } from "@web/libs/features/requests/requestSlice";
import {
  closeApproveModal,
  closeCancelModal,
  closeDetailModal,
  openApproveModal,
  openCancelModal,
  openDetailModal,
} from "@web/libs/features/table/tableSlice";
import { NAV_LINK, NAV_TITLE } from "@web/libs/nav";
import {
  IRequest,
  REQUEST_STATUS_TAG,
  RequestAction,
  RequestStatus,
  RequestStatusOptions,
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

const breadcrumbs: ItemType[] = [
  {
    href: NAV_LINK.MANAGE_REQUESTS,
    title: NAV_TITLE.MANAGE_REQUESTS,
  },
  {
    title: NAV_TITLE.BUSY_SCHEDULE_LIST,
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
    title: "Creator",
    dataIndex: "creator",
    render: (creator) => creator?.fullName || "N/A",
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
    render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
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
  onOpenApproveModal,
  onOpenCancelModal,
}: {
  record: IRequest;
  onOpenDetail: (id: string) => void;
  onOpenApproveModal: (id: string) => void;
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
          title="Approve"
          onClick={() => onOpenApproveModal(record.id)}
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

const BusyScheduleList = () => {
  const [searchParams, setSearchParams] = useState<{
    name?: string;
    status?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
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
    isDetailModalOpen,
    isCancelModalOpen,
    isApproveModalOpen,
    selectedItemId,
  } = useSelector((state: RootState) => state.table);
  const { selectedBusySchedule } = useSelector(
    (state: RootState) => state.request,
  );

  const {
    data: busySchedulesData,
    isFetching,
    refetch,
  } = useGetBusySchedulesQuery(searchParams);

  const [fetchBusyScheduleDetail, { data: busyScheduleDetail }] =
    useLazyGetBusyScheduleByIdQuery();

  const [updateBusyScheduleStatus, { isLoading: isUpdatingStatus }] =
    useUpdateBusyScheduleStatusMutation();

  const searchForm = useForm();

  const tableColumns = columnsTitles.map((item, index) => {
    if (item.dataIndex === "method") {
      return {
        ...item,
        key: index,
        render: (record: IRequest) => (
          <BusyScheduleActions
            record={record}
            onOpenDetail={handleOpenDetail}
            onOpenApproveModal={handleOpenApproveModal}
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
    fetchBusyScheduleDetail(id);
  };

  const handleCloseDetail = () => {
    dispatch(closeDetailModal());
    dispatch(clearSelectedBusySchedule());
  };

  const handleOpenApproveModal = (id: string) => {
    dispatch(openApproveModal(id));
  };

  const handleOpenCancelModal = (id: string) => {
    dispatch(openCancelModal(id));
  };

  const handleApprove = async () => {
    if (!selectedItemId) return;

    try {
      await updateBusyScheduleStatus({
        id: selectedItemId,
        action: RequestAction.APPROVE,
      }).unwrap();
      toast.success("Busy schedule request approved successfully");
      refetch();
      dispatch(closeApproveModal());
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
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

  const handlePaginationChange = (newPagination: TablePaginationConfig) => {
    setSearchParams({
      ...searchParams,
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.BUSY_SCHEDULE_LIST}>
      <div id="busy-schedules-container" className="flex flex-col gap-6">
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
            onClick={handleCloseDetail}
          />,
          busyScheduleDetail?.data.status === RequestStatus.PENDING && (
            <CustomButton
              key="approve"
              type="primary"
              title="Approve"
              onClick={() => handleOpenApproveModal(busyScheduleDetail.data.id)}
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
              <Typography.Text type="secondary">Description:</Typography.Text>
              <Typography.Paragraph className="mt-1">
                {busyScheduleDetail.data.description || ""}
              </Typography.Paragraph>
            </div>

            <div>
              <Typography.Text type="secondary">Creator:</Typography.Text>
              <Typography.Text className="ml-2">
                {busyScheduleDetail.data.creator?.fullName || "N/A"}
              </Typography.Text>
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

      {/* Approve Confirmation Modal */}
      <Modal
        title="Approve Busy Schedule Request"
        open={isApproveModalOpen}
        onCancel={() => dispatch(closeApproveModal())}
        footer={[
          <CustomButton
            key="back"
            title="Cancel"
            onClick={() => dispatch(closeApproveModal())}
          />,
          <CustomButton
            key="submit"
            type="primary"
            title="Approve Request"
            loading={isUpdatingStatus}
            onClick={handleApprove}
          />,
        ]}
      >
        <Typography.Paragraph>
          Are you sure you want to approve this busy schedule request?
        </Typography.Paragraph>
      </Modal>

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
            loading={isUpdatingStatus}
            onClick={handleCancel}
          />,
        ]}
      >
        <Typography.Paragraph>
          Are you sure you want to cancel this busy schedule request? This
          action cannot be undone.
        </Typography.Paragraph>
      </Modal>
    </PageLayout>
  );
};

export default BusyScheduleList;
