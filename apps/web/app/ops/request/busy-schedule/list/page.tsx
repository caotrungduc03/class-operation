"use client";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTooltip from "@web/components/common/CustomTooltip";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import { DATE_TIME_FORMAT, TableColumn } from "@web/libs/common";
import {
  useGetBusySchedulesQuery,
  useLazyGetBusyScheduleByIdQuery,
  useUpdateBusyScheduleStatusMutation,
} from "@web/libs/features/requests/requestApi";
import {
  closeApproveModal,
  closeCancelModal,
  closeDetailModal,
  closeRejectModal,
  openApproveModal,
  openCancelModal,
  openDetailModal,
  openRejectModal,
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
import { IUser } from "@web/libs/user";
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
    href: NAV_LINK.MANAGE_REQUESTS,
    title: NAV_TITLE.MANAGE_REQUESTS,
  },
  {
    title: NAV_TITLE.BUSY_SCHEDULE_LIST,
  },
];

const searchSchema = z.object({
  name: z.string().optional(),
  status: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

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
    title: "Creator",
    dataIndex: "creator",
    render: (creator: IUser) => creator?.fullName || "N/A",
  },
  {
    title: "Requester",
    dataIndex: "requester",
    render: (requester: IUser) => requester?.fullName || "-",
  },
  {
    title: "Approver",
    dataIndex: "approver",
    render: (approver: IUser) => approver?.fullName || "-",
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
  onOpenRejectModal,
}: {
  record: IRequest;
  onOpenDetail: (id: string) => void;
  onOpenApproveModal: (id: string) => void;
  onOpenCancelModal: (id: string) => void;
  onOpenRejectModal: (id: string) => void;
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
      {record.status === RequestStatus.PENDING && (
        <CustomButton
          type="link"
          title="Reject"
          color="danger"
          onClick={() => onOpenRejectModal(record.id)}
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
    isRejectModalOpen,
    selectedItemId,
  } = useSelector((state: RootState) => state.table);
  const {
    data: busySchedulesData,
    isFetching,
    refetch,
  } = useGetBusySchedulesQuery(searchParams);

  const [fetchBusyScheduleDetail, { data: busyScheduleDetail }] =
    useLazyGetBusyScheduleByIdQuery();

  const [updateBusyScheduleStatus, { isLoading: isUpdatingStatus }] =
    useUpdateBusyScheduleStatusMutation();

  const searchForm = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

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
            onOpenRejectModal={handleOpenRejectModal}
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

  const onSubmitSearch = (data: SearchFormData) => {
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

  const handleOpenApproveModal = (id: string) => {
    dispatch(openApproveModal(id));
  };

  const handleOpenCancelModal = (id: string) => {
    dispatch(openCancelModal(id));
  };

  const handleOpenRejectModal = (id: string) => {
    dispatch(openRejectModal(id));
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

  const handleReject = async () => {
    if (!selectedItemId) return;
    try {
      await updateBusyScheduleStatus({
        id: selectedItemId,
        action: RequestAction.REJECT,
      }).unwrap();
      toast.success("Busy schedule request rejected successfully");
      refetch();
      dispatch(closeRejectModal());
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
            icon={<CloseOutlined />}
            onClick={handleCloseDetail}
          />,
          busyScheduleDetail?.data.status === RequestStatus.PENDING && (
            <CustomButton
              key="approve"
              type="primary"
              title="Approve"
              icon={<CheckOutlined />}
              onClick={() => handleOpenApproveModal(busyScheduleDetail.data.id)}
            />
          ),
          busyScheduleDetail?.data.status === RequestStatus.PENDING && (
            <CustomButton
              key="reject"
              type="primary"
              color="danger"
              title="Reject"
              icon={<CloseOutlined />}
              onClick={() => handleOpenRejectModal(busyScheduleDetail.data.id)}
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
            icon={<CloseOutlined />}
            onClick={() => dispatch(closeApproveModal())}
          />,
          <CustomButton
            key="submit"
            type="primary"
            title="Approve Request"
            icon={<CheckOutlined />}
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
            icon={<CloseOutlined />}
            onClick={() => dispatch(closeCancelModal())}
          />,
          <CustomButton
            key="submit"
            type="primary"
            color="danger"
            title="Yes, Cancel Request"
            icon={<DeleteOutlined />}
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

      {/* Reject Confirmation Modal */}
      <Modal
        title="Reject Busy Schedule Request"
        open={isRejectModalOpen}
        onCancel={() => dispatch(closeRejectModal())}
        footer={[
          <CustomButton
            key="back"
            title="Cancel"
            icon={<CloseOutlined />}
            onClick={() => dispatch(closeRejectModal())}
          />,
          <CustomButton
            key="submit"
            type="primary"
            color="danger"
            title="Reject Request"
            icon={<CloseOutlined />}
            loading={isUpdatingStatus}
            onClick={handleReject}
          />,
        ]}
      >
        <Typography.Paragraph>
          Are you sure you want to reject this busy schedule request?
        </Typography.Paragraph>
      </Modal>
    </PageLayout>
  );
};

export default BusyScheduleList;
