"use client";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTextArea from "@web/components/common/CustomTextArea";
import CustomTooltip from "@web/components/common/CustomTooltip";
import FilterGrid from "@web/components/common/FilterGrid";
import { useDebouncedSelect } from "@web/hooks/useDebouncedSelect";
import PageLayout from "@web/layouts/PageLayout";
import { TableColumn } from "@web/libs/common";
import {
  useCreateFieldMutation,
  useDeleteFieldMutation,
  useGetFieldsQuery,
  useLazyGetFieldByIdQuery,
  useUpdateFieldMutation,
} from "@web/libs/features/fields/fieldApi";
import {
  closeCreateModal,
  openCreateModal,
} from "@web/libs/features/table/tableSlice";
import { useGetManagersQuery } from "@web/libs/features/users/userApi";
import { CreateFieldDto, IField } from "@web/libs/field";
import { NAV_TITLE } from "@web/libs/nav";
import { RootState } from "@web/libs/store";
import { IUser } from "@web/libs/user";
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
    title: NAV_TITLE.MANAGE_FIELDS,
  },
];

const columnsTitles: TableColumn<IField>[] = [
  {
    title: "STT",
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
    title: "Description",
    dataIndex: "description",
  },
  {
    title: "Leader",
    dataIndex: "leader",
    render: (leader: IUser | null) => leader?.fullName,
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

// Define Zod schema for field form validation
const fieldFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  leaderId: z.string().optional().nullable(),
});

// Create type from Zod schema
type FieldFormValues = z.infer<typeof fieldFormSchema>;

// Add search form schema
const searchFormSchema = z.object({
  search: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const FieldActions = ({
  record,
  onEdit,
  onDelete,
}: {
  record: IField;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <CustomDropdown>
      <CustomButton
        type="link"
        title="Edit"
        icon={<EditOutlined />}
        onClick={() => onEdit(record.id)}
      />
      <CustomButton
        type="link"
        title="Delete"
        color="danger"
        icon={<DeleteOutlined />}
        onClick={() => onDelete(record.id)}
      />
    </CustomDropdown>
  );
};

const Fields = () => {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultCurrent: 1,
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [searchParams, setSearchParams] = useState<{
    search?: string;
    page?: number;
    limit?: number;
  }>({
    page: 1,
    limit: 10,
  });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { isOpenCreateModal } = useSelector((state: RootState) => state.table);
  const dispatch = useDispatch();

  // Search form
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
  });

  // Field form with validation
  const fieldForm = useForm<FieldFormValues>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      name: "",
      description: "",
      leaderId: null,
    },
  });

  // Add the useDebouncedSelect hook for managers
  const { selectProps: leaderSelectProps } = useDebouncedSelect({
    control: fieldForm.control,
    name: "leaderId",
    useGetDataQuery: useGetManagersQuery,
    labelField: "fullName",
    valueField: "id",
    queryArgs: { roleName: "manager" },
  });

  const { data, isFetching, refetch } = useGetFieldsQuery(searchParams);
  const [createField, { isLoading: isCreating }] = useCreateFieldMutation();
  const [updateField, { isLoading: isUpdating }] = useUpdateFieldMutation();
  const [deleteField, { isLoading: isDeleting }] = useDeleteFieldMutation();
  const [getFieldById, { isFetching: isLoadingField }] =
    useLazyGetFieldByIdQuery();

  const { current, pageSize } = pagination;

  const tableColumns = useMemo(() => {
    return columnsTitles.map((item, index) => {
      if (item.dataIndex === "method") {
        return {
          ...item,
          render: (_, record: IField) => {
            return (
              <FieldActions
                record={record}
                onEdit={handleEditField}
                onDelete={handleDeleteField}
              />
            );
          },
          key: index,
        };
      }
      if (item.dataIndex === "name") {
        return {
          ...item,
          render: (name: string, record: IField) => (
            <CustomTooltip title={name}>
              <span
                className="cursor-pointer text-blue-500 hover:text-blue-700"
                onClick={() => handleEditField(record.id)}
              >
                {name}
              </span>
            </CustomTooltip>
          ),
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
      })) || []
    );
  }, [data, current, pageSize]);

  const onSubmitSearch = (formData: { search?: string }) => {
    setSearchParams({
      ...searchParams,
      search: formData.search,
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
    refetch();
  };

  const handleEditField = (id: string) => {
    setSelectedFieldId(id);
    setIsEditMode(true);

    getFieldById(id)
      .unwrap()
      .then((response) => {
        if (response?.data) {
          const field = response.data;
          fieldForm.reset({
            name: field.name,
            description: field.description,
            leaderId: field.leaderId,
          });
          dispatch(openCreateModal());
        }
      })
      .catch((error) => {
        // Error handling
      });
  };

  const handleDeleteField = (id: string) => {
    Modal.confirm({
      title: "Delete Field",
      content: "Are you sure you want to delete this field?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteField(id).unwrap();
          toast.success("Field deleted successfully");
          refetch();
        } catch (error) {
          // Handled by the apiErrorMiddleware
        }
      },
    });
  };

  const onSubmitField = async (formData: FieldFormValues) => {
    try {
      const fieldData: CreateFieldDto = {
        name: formData.name,
        description: formData.description,
        leaderId: formData.leaderId || undefined,
      };

      if (isEditMode && selectedFieldId) {
        await updateField({ id: selectedFieldId, data: fieldData }).unwrap();
        toast.success("Field updated successfully");
      } else {
        await createField(fieldData).unwrap();
        toast.success("Field created successfully");
      }
      handleCloseDrawer();
      refetch();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCloseDrawer = () => {
    dispatch(closeCreateModal());
    fieldForm.reset();
    setIsEditMode(false);
    setSelectedFieldId(null);
  };

  const handlePaginationChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
    setSearchParams({
      ...searchParams,
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  const handleAddField = () => {
    setIsEditMode(false);
    fieldForm.reset({
      name: "",
      description: "",
      leaderId: null,
    });
    dispatch(openCreateModal());
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MANAGE_FIELDS}>
      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-4">
            <FilterGrid>
              <CustomInput
                control={searchForm.control}
                name="search"
                size="large"
                placeholder="Search by name"
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
                title="Add Field"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAddField}
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
        title={isEditMode ? "Edit Field" : "Add Field"}
        open={isOpenCreateModal}
        onCancel={handleCloseDrawer}
        onSubmit={fieldForm.handleSubmit(onSubmitField)}
        loading={isCreating || isUpdating || isLoadingField}
      >
        <div className="flex flex-col gap-4">
          <CustomInput
            control={fieldForm.control}
            name="name"
            label="Field Name"
            placeholder="Enter field name"
            required
          />

          <CustomTextArea
            control={fieldForm.control}
            name="description"
            label="Description"
            placeholder="Enter field description"
          />

          <CustomSelect
            control={fieldForm.control}
            name="leaderId"
            label="Leader"
            placeholder="Select leader"
            options={leaderSelectProps.options}
            onFocus={leaderSelectProps.onFocus}
            onPopupScroll={leaderSelectProps.onPopupScroll}
            loading={leaderSelectProps.loading}
            showSearch
          />
        </div>
      </CustomDrawer>
    </PageLayout>
  );
};

export default Fields;
