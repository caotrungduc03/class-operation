"use client";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomInputNumber from "@web/components/common/CustomInputNumber";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomRangePicker from "@web/components/common/CustomeRangePicker";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import { TableColumn } from "@web/libs/common";
import {
  useCancelWeeklyNormMutation,
  useCreateWeeklyNormMutation,
  useGetWeeklyNormsQuery,
  useLazyGetWeeklyNormByIdQuery,
  useUpdateWeeklyNormMutation,
} from "@web/libs/features/requests/requestApi";
import { clearSelectedWeeklyNorm } from "@web/libs/features/requests/requestSlice";
import {
  closeCreateModal,
  openCreateModal,
} from "@web/libs/features/table/tableSlice";
import {
  IRequest,
  RequestStatus,
  RequestStatusOptions,
  RequestType,
} from "@web/libs/request";
import { RootState } from "@web/libs/store";
import {
  Badge,
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
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const breadcrumbs: ItemType[] = [
  {
    href: "#",
    title: "LMS",
  },
  {
    title: "Weekly Norms",
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
    title: "Status",
    dataIndex: "status",
    render: (status: RequestStatus) => {
      let color = "default";
      switch (status) {
        case RequestStatus.APPROVED:
          color = "success";
          break;
        case RequestStatus.REJECTED:
          color = "error";
          break;
        case RequestStatus.CANCELED:
          color = "warning";
          break;
        default:
          color = "processing";
      }
      return <Badge status={color as any} text={status} />;
    },
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
  },
  {
    title: "Updated At",
    dataIndex: "updatedAt",
    render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
  },
  {
    title: "Actions",
    dataIndex: "method",
  },
];

const WeeklyNormActions = ({
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
  const [cancelWeeklyNorm, { isLoading: isCanceling }] =
    useCancelWeeklyNormMutation();

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

const WeeklyNorms = () => {
  const [searchParams, setSearchParams] = useState<{
    search?: string;
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
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [selectedNormId, setSelectedNormId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const dispatch = useDispatch();
  const { isOpenCreateModal } = useSelector((state: RootState) => state.table);
  const { selectedWeeklyNorm } = useSelector(
    (state: RootState) => state.request,
  );

  const {
    data: weeklyNormsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetWeeklyNormsQuery(searchParams);

  const [fetchNormDetail, { data: normDetail, isLoading: isDetailLoading }] =
    useLazyGetWeeklyNormByIdQuery();

  const [createWeeklyNorm, { isLoading: isCreating }] =
    useCreateWeeklyNormMutation();
  const [updateWeeklyNorm, { isLoading: isUpdating }] =
    useUpdateWeeklyNormMutation();
  const [cancelWeeklyNorm, { isLoading: isCanceling }] =
    useCancelWeeklyNormMutation();

  const searchForm = useForm();

  const weeklyNormForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      weeklyNorms: [
        {
          rangeDate: [undefined, undefined],
          quantity: 1,
        },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: weeklyNormForm.control,
    name: "weeklyNorms",
  });

  const tableColumns = columnsTitles.map((item, index) => {
    if (item.dataIndex === "method") {
      return {
        ...item,
        key: index,
        render: (record: IRequest) => (
          <WeeklyNormActions
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
      weeklyNormsData?.data?.items.map((item, index) => ({
        ...item,
        index: ((current || 1) - 1) * (pageSize || 10) + index + 1,
        method: item,
      })) || []
    );
  }, [weeklyNormsData, current, pageSize]);

  useEffect(() => {
    if (!isLoading) return;

    refetch();
  }, [searchParams]);

  useEffect(() => {
    if (isEditMode && selectedWeeklyNorm) {
      weeklyNormForm.setValue("name", selectedWeeklyNorm.name);
      weeklyNormForm.setValue("description", selectedWeeklyNorm.description);

      if (
        selectedWeeklyNorm.weeklyNorms &&
        selectedWeeklyNorm.weeklyNorms.length > 0
      ) {
        const formattedNorms = selectedWeeklyNorm.weeklyNorms.map((norm) => ({
          rangeDate: [new Date(norm.startDate), new Date(norm.endDate)] as [
            Date,
            Date,
          ],
          quantity: norm.quantity,
        }));
        replace(formattedNorms);
      }
    }
  }, [isEditMode, selectedWeeklyNorm, replace, weeklyNormForm]);

  const onSubmitSearch = (data: { search?: string; status?: string }) => {
    setSearchParams({
      ...searchParams,
      ...data,
      page: 1,
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

  const handleOpenDetail = (id: string) => {
    setSelectedNormId(id);
    setIsDetailModalOpen(true);
    fetchNormDetail(id);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedNormId(null);
    dispatch(clearSelectedWeeklyNorm());
  };

  const handleStartEdit = (id: string) => {
    setSelectedNormId(id);
    setIsEditMode(true);
    setIsDetailModalOpen(false);
    dispatch(openCreateModal());
  };

  const handleOpenCancelModal = (id: string) => {
    setSelectedNormId(id);
    setIsCancelModalOpen(true);
  };

  const handleCancel = async () => {
    if (!selectedNormId) return;

    try {
      await cancelWeeklyNorm(selectedNormId).unwrap();
      toast.success("Weekly norm request canceled successfully");
      refetch();
      setIsCancelModalOpen(false);
    } catch (error) {
      toast.error("Failed to cancel weekly norm request");
    }
  };

  const onSubmitCreate = async (data) => {
    const formattedData = {
      name: data.name,
      description: data.description || "",
      type: RequestType.WEEKLY_NORM,
      weeklyNorms: data.weeklyNorms.map((norm) => ({
        startDate: norm.rangeDate[0],
        endDate: norm.rangeDate[1],
        quantity: norm.quantity,
      })),
    };

    try {
      if (isEditMode && selectedNormId) {
        const res = await updateWeeklyNorm({
          id: selectedNormId,
          data: formattedData,
        }).unwrap();
        toast.success(res.message);
      } else {
        const res = await createWeeklyNorm(formattedData).unwrap();
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
    weeklyNormForm.reset();
    setIsEditMode(false);
    setSelectedNormId(null);
  };

  const addNormEntry = () => {
    append({
      rangeDate: [undefined, undefined],
      quantity: 1,
    });
  };

  const removeNormEntry = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("At least one weekly norm is required");
    }
  };

  const handlePaginationChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
    setSearchParams({
      ...searchParams,
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs} title="Weekly Norms">
      <div id="weekly-norms-container" className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-4">
            <FilterGrid>
              <CustomInput
                control={searchForm.control}
                name="search"
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
                title="Create Weekly Norm Request"
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
        title="Weekly Norm Request Details"
        open={isDetailModalOpen}
        onCancel={handleCloseDetail}
        footer={[
          <CustomButton
            key="close"
            title="Close"
            onClick={handleCloseDetail}
          />,
          selectedWeeklyNorm?.status === RequestStatus.PENDING && (
            <CustomButton
              key="edit"
              type="primary"
              title="Edit"
              onClick={() => handleStartEdit(selectedWeeklyNorm.id)}
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
                {normDetail.data.description || "No description provided"}
              </Typography.Paragraph>
            </div>

            <div>
              <Typography.Text type="secondary">Status:</Typography.Text>
              <div className="mt-1">
                <Tag
                  color={
                    normDetail.data.status === RequestStatus.APPROVED
                      ? "success"
                      : normDetail.data.status === RequestStatus.REJECTED
                        ? "error"
                        : normDetail.data.status === RequestStatus.CANCELED
                          ? "warning"
                          : "processing"
                  }
                >
                  {normDetail.data.status}
                </Tag>
              </div>
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

      {/* Create/Edit Drawer */}
      <CustomDrawer
        title={
          isEditMode ? "Edit Weekly Norm Request" : "Create Weekly Norm Request"
        }
        open={isOpenCreateModal}
        onCancel={handleCloseDrawer}
        onSubmit={weeklyNormForm.handleSubmit(onSubmitCreate)}
        loading={isCreating || isUpdating}
      >
        <div className="flex flex-col gap-4">
          <CustomInput
            control={weeklyNormForm.control}
            name="name"
            label="Request Name"
            placeholder="Enter request name"
            size="large"
            required
          />

          <CustomInput
            control={weeklyNormForm.control}
            name="description"
            label="Description"
            placeholder="Enter description (optional)"
            size="large"
          />

          <Divider orientation="left">Weekly Norms</Divider>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-md border border-gray-200 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <Typography.Title level={5} className="m-0">
                  Weekly Norm #{index + 1}
                </Typography.Title>
                <CustomButton
                  type="text"
                  color="danger"
                  variant="text"
                  icon={<DeleteOutlined />}
                  onClick={() => removeNormEntry(index)}
                  disabled={fields.length <= 1}
                />
              </div>

              <CustomRangePicker
                control={weeklyNormForm.control}
                name={`weeklyNorms.${index}.rangeDate`}
                label="Date Range"
                size="large"
                required
              />

              <CustomInputNumber
                control={weeklyNormForm.control}
                name={`weeklyNorms.${index}.quantity`}
                label="Quantity"
                min={1}
                size="large"
                required
              />
            </div>
          ))}

          <CustomButton
            type="dashed"
            title="Add Weekly Norm"
            onClick={addNormEntry}
            icon={<PlusOutlined />}
            className="mt-2"
            size="large"
          />
        </div>
      </CustomDrawer>

      {/* Cancel Confirmation Modal */}
      <Modal
        title="Cancel Weekly Norm Request"
        open={isCancelModalOpen}
        onCancel={() => setIsCancelModalOpen(false)}
        footer={[
          <CustomButton
            key="back"
            title="No, Keep It"
            onClick={() => setIsCancelModalOpen(false)}
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
          Are you sure you want to cancel this weekly norm request? This action
          cannot be undone.
        </Typography.Paragraph>
      </Modal>
    </PageLayout>
  );
};

export default WeeklyNorms;
