"use client";
import { PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTextArea from "@web/components/common/CustomTextArea";
import FilterGrid from "@web/components/common/FilterGrid";
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
    title: "#",
    dataIndex: "index",
  },
  {
    title: "Name",
    dataIndex: "name",
    render: (_, record: IField) => (
      <div className="flex flex-col">
        <span className="font-medium text-blue-500">{record.code}</span>
        <span>{record.name}</span>
      </div>
    ),
  },
  {
    title: "Description",
    dataIndex: "description",
  },
  {
    title: "Leader",
    dataIndex: "leader",
    render: (leader: IUser | null) => {
      if (!leader) return null;
      return (
        <div className="flex flex-col">
          <span className="font-bold text-blue-500">{leader.detail.code}</span>
          <span>{leader.fullName}</span>
        </div>
      );
    },
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
  const searchForm = useForm();

  // Field form with validation
  const fieldForm = useForm<FieldFormValues>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      name: "",
      description: "",
      leaderId: null,
    },
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
          render: (record: IField) => {
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
            options={[]}
          />
        </div>
      </CustomDrawer>
    </PageLayout>
  );
};

export default Fields;
