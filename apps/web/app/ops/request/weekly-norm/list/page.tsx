"use client";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTooltip from "@web/components/common/CustomTooltip";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import { DATE_FORMAT, DATE_TIME_FORMAT, TableColumn } from "@web/libs/common";
import {
  useGetWeeklyNormsQuery,
  useLazyGetWeeklyNormByIdQuery,
  useUpdateWeeklyNormStatusMutation,
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
    title: NAV_TITLE.WEEKLY_NORM_LIST,
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
    title: "Description",
    dataIndex: "description",
  },
  {
    title: "Creator",
    dataIndex: "creator",
    render: (creator: IUser) => creator?.fullName,
  },
  {
    title: "Requester",
    dataIndex: "requester",
    render: (requester: IUser) => requester?.fullName,
  },
  {
    title: "Approver",
    dataIndex: "approver",
    render: (approver: IUser) => approver?.fullName,
  },
  {
    title: "Weekly Norms",
    dataIndex: "weeklyNorms",
    render: (weeklyNorms: any[]) => {
      if (!weeklyNorms || weeklyNorms.length === 0) return;
      return (
        <div className="space-y-1">
          {weeklyNorms.map((norm, index) => (
            <div key={index} className="text-sm">
              {dayjs(norm.startDate).format(DATE_FORMAT)} -{" "}
              {dayjs(norm.endDate).format(DATE_FORMAT)} | Qty: {norm.quantity}
            </div>
          ))}
        </div>
      );
    },
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
    title: "Updated At",
    dataIndex: "updatedAt",
    render: (date: string) => dayjs(date).format(DATE_TIME_FORMAT),
  },
  {
    title: "",
    dataIndex: "method",
    fixed: "right",
  },
];

const WeeklyNormActions = ({
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
        icon={<EyeOutlined />}
        onClick={() => onOpenDetail(record.id)}
      />
      {record.status === RequestStatus.PENDING && (
        <CustomButton
          type="link"
          title="Approve"
          icon={<CheckOutlined />}
          onClick={() => onOpenApproveModal(record.id)}
        />
      )}
      {record.status === RequestStatus.PENDING && (
        <CustomButton
          type="link"
          title="Reject"
          color="danger"
          icon={<CloseOutlined />}
          onClick={() => onOpenRejectModal(record.id)}
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

const WeeklyNormList = () => {
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
    isDetailModalOpen,
    isCancelModalOpen,
    isApproveModalOpen,
    isRejectModalOpen,
    selectedItemId,
  } = useSelector((state: RootState) => state.table);

  const {
    data: weeklyNormsData,
    isFetching,
    refetch,
  } = useGetWeeklyNormsQuery(searchParams);

  const [fetchNormDetail, { data: normDetail }] =
    useLazyGetWeeklyNormByIdQuery();

  const [updateWeeklyNormStatus, { isLoading: isUpdatingStatus }] =
    useUpdateWeeklyNormStatusMutation();

  const searchForm = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  const tableColumns = useMemo(() => {
    return columnsTitles.map((item, index) => {
      if (item.dataIndex === "method") {
        return {
          ...item,
          key: index,
          render: (record: IRequest) => (
            <WeeklyNormActions
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
  }, []);

  const { current, pageSize } = pagination;

  const tableData = useMemo(() => {
    return (
      weeklyNormsData?.data?.items.map((item, index) => ({
        ...item,
        index: ((current || 1) - 1) * (pageSize || 10) + index + 1,
        method: item,
      })) || []
    );
  }, [weeklyNormsData, current, pageSize]);

  // Add this useEffect to update pagination when data changes
  useEffect(() => {
    if (weeklyNormsData?.data) {
      setPagination((prev) => ({
        ...prev,
        current: weeklyNormsData.data.page || prev.current,
        pageSize: weeklyNormsData.data.limit || prev.pageSize,
        total: weeklyNormsData.data.total || 0,
      }));
    }
  }, [weeklyNormsData]);

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
    fetchNormDetail(id);
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

  const handleApprove = async () => {
    if (!selectedItemId) return;

    try {
      await updateWeeklyNormStatus({
        id: selectedItemId,
        action: RequestAction.APPROVE,
      }).unwrap();
      toast.success("Weekly norm request approved successfully");
      refetch();
      dispatch(closeApproveModal());
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCancel = async () => {
    if (!selectedItemId) return;

    try {
      await updateWeeklyNormStatus({
        id: selectedItemId,
        action: RequestAction.CANCEL,
      }).unwrap();
      toast.success("Weekly norm request canceled successfully");
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

  const handleOpenRejectModal = (id: string) => {
    dispatch(openCancelModal(id));
  };

  const handleCloseRejectModal = (id: string) => {
    dispatch(openRejectModal(id));
  };

  const handleReject = async () => {
    if (!selectedItemId) return;
    try {
      await updateWeeklyNormStatus({
        id: selectedItemId,
        action: RequestAction.REJECT,
      }).unwrap();
      toast.success("Weekly norm request rejected successfully");
      refetch();
      dispatch(closeRejectModal());
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.WEEKLY_NORM_LIST}>
      <div id="weekly-norms-container" className="flex flex-col gap-6">
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
        title="Weekly Norm Request Details"
        open={isDetailModalOpen}
        onCancel={handleCloseDetail}
        footer={[
          <CustomButton
            key="close"
            title="Close"
            icon={<CloseOutlined />}
            onClick={handleCloseDetail}
          />,
          normDetail?.data.status === RequestStatus.PENDING && (
            <CustomButton
              key="approve"
              type="primary"
              title="Approve"
              icon={<CheckOutlined />}
              onClick={() => handleOpenApproveModal(normDetail.data.id)}
            />
          ),
          normDetail?.data.status === RequestStatus.PENDING && (
            <CustomButton
              key="reject"
              type="primary"
              color="danger"
              title="Reject"
              icon={<CloseOutlined />}
              onClick={() => handleOpenRejectModal(normDetail.data.id)}
            />
          ),
        ]}
        width={800}
      >
        {normDetail ? (
          <div className="flex flex-col gap-4">
            <div>
              <Typography.Text type="secondary">Request Name:</Typography.Text>
              <Typography.Title level={5} className="mt-1">
                {normDetail.data.name}
              </Typography.Title>
            </div>

            <div>
              <Typography.Text type="secondary">Description:</Typography.Text>
              <Typography.Paragraph className="mt-1">
                {normDetail.data.description || ""}
              </Typography.Paragraph>
            </div>

            <div>
              <Typography.Text type="secondary">Creator:</Typography.Text>
              <Typography.Text className="ml-2">
                {normDetail.data.creator?.fullName || "N/A"}
              </Typography.Text>
            </div>

            <div>
              <Typography.Text type="secondary">Status:</Typography.Text>
              <span className="ml-2">
                <Tag color={REQUEST_STATUS_TAG[normDetail.data.status]}>
                  {normDetail.data.status}
                </Tag>
              </span>
            </div>

            <Divider orientation="left">Weekly Norms</Divider>

            {normDetail.data.weeklyNorms &&
              normDetail.data.weeklyNorms.map((norm, index) => (
                <Card key={index} size="small" className="mb-4">
                  <div className="flex justify-between">
                    <Typography.Text strong>Week #{index + 1}</Typography.Text>
                    <Typography.Text strong>
                      Quantity: {norm.quantity}
                    </Typography.Text>
                  </div>
                  <Typography.Text>
                    {dayjs(norm.startDate).format("DD/MM/YYYY")} -{" "}
                    {dayjs(norm.endDate).format("DD/MM/YYYY")}
                  </Typography.Text>
                </Card>
              ))}

            <div className="flex justify-between">
              <div>
                <Typography.Text type="secondary">Created At:</Typography.Text>
                <Typography.Text className="ml-2">
                  {dayjs(normDetail.data.createdAt).format("DD/MM/YYYY HH:mm")}
                </Typography.Text>
              </div>

              <div>
                <Typography.Text type="secondary">Updated At:</Typography.Text>
                <Typography.Text className="ml-2">
                  {dayjs(normDetail.data.updatedAt).format("DD/MM/YYYY HH:mm")}
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
        title="Approve Weekly Norm Request"
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
          Are you sure you want to approve this weekly norm request? This will
          activate all associated weekly norms.
        </Typography.Paragraph>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        title="Cancel Weekly Norm Request"
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
            icon={<StopOutlined />}
            loading={isUpdatingStatus}
            onClick={handleCancel}
          />,
        ]}
      >
        <Typography.Paragraph>
          Are you sure you want to cancel this weekly norm request? This action
          cannot be undone and will deactivate all associated weekly norms.
        </Typography.Paragraph>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        title="Reject Weekly Norm Request"
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
          Are you sure you want to reject this weekly norm request?
        </Typography.Paragraph>
      </Modal>
    </PageLayout>
  );
};

export default WeeklyNormList;
