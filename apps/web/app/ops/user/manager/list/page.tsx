"use client";
import { PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import FilterGrid from "@web/components/common/FilterGrid";
import { useDebouncedSelect } from "@web/hooks/useDebouncedSelect";
import PageLayout from "@web/layouts/PageLayout";
import { DATE_TIME_FORMAT, TableColumn } from "@web/libs/common";
import { useGetDepartmentsQuery } from "@web/libs/features/departments/departmentApi";
import {
  closeCreateModal,
  openCreateModal,
} from "@web/libs/features/table/tableSlice";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetManagersQuery,
} from "@web/libs/features/users/userApi";
import { NAV_LINK, NAV_TITLE } from "@web/libs/nav";
import {
  ManagerRoleOptions,
  ROLE_LABEL,
  ROLE_TAG,
  RoleName,
} from "@web/libs/role";
import { RootState } from "@web/libs/store";
import {
  IDetailUser,
  IRole,
  IUser,
  STATUS_LABEL,
  STATUS_TAG,
  StatusOptions,
  UserStatus,
} from "@web/libs/user";
import { Card, Modal, Table, TablePaginationConfig, Tag } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

const breadcrumbs: ItemType[] = [
  {
    href: "#",
    title: NAV_TITLE.MANAGE_USERS,
  },
  {
    title: NAV_TITLE.MANAGER_LIST,
  },
];

const columnsTitles: TableColumn<IUser>[] = [
  {
    title: "#",
    dataIndex: "index",
  },
  {
    title: "Code",
    dataIndex: "detail",
    render: (detail: IDetailUser) => detail.code,
  },
  {
    title: "Full Name",
    dataIndex: "fullName",
  },
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "Phone",
    dataIndex: "phoneNumber",
  },
  {
    title: "Role",
    dataIndex: "role",
    render: (role: IRole) => (
      <Tag color={ROLE_TAG[role.roleName]}>{ROLE_LABEL[role.roleName]}</Tag>
    ),
  },
  {
    title: "Department",
    dataIndex: "detail",
    render: (detail: IDetailUser) => detail?.department?.name,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: UserStatus) => (
      <Tag color={STATUS_TAG[status]}>{STATUS_LABEL[status]}</Tag>
    ),
  },
  {
    title: "Created Date",
    dataIndex: "createdAt",
    render: (date: string) => dayjs(date).format(DATE_TIME_FORMAT),
  },
  {
    title: "Updated Date",
    dataIndex: "updatedAt",
    render: (date: string) => dayjs(date).format(DATE_TIME_FORMAT),
  },
  {
    title: "",
    dataIndex: "method",
    fixed: "right",
  },
];

// Define Zod schema for manager form validation
const managerFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    phoneNumber: z.string().optional(),
    roleName: z.nativeEnum(RoleName, { required_error: "Role is required" }),
    status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED]).optional(),
    departmentId: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Define type from schema
type ManagerFormValues = z.infer<typeof managerFormSchema>;

const ManagerActions = ({
  record,
  onEdit,
  onDelete,
  onView,
}: {
  record: IUser;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) => {
  return (
    <CustomDropdown>
      <CustomButton
        type="link"
        title="View"
        onClick={() => onView(record.id)}
      />
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

const ManagerList = () => {
  const router = useRouter();
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultCurrent: 1,
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [searchParams, setSearchParams] = useState<{
    search?: string;
    roleName?: string;
    status?: string;
    page?: number;
    limit?: number;
  }>({
    page: 1,
    limit: 10,
  });
  const { isOpenCreateModal } = useSelector((state: RootState) => state.table);
  const dispatch = useDispatch();

  // Search form
  const searchForm = useForm();

  // Manager form with validation
  const managerForm = useForm<ManagerFormValues>({
    resolver: zodResolver(managerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      roleName: RoleName.MANAGE,
      status: UserStatus.ACTIVE,
      departmentId: "",
    },
  });

  // Use debounced select hook for departments
  const { selectProps: departmentSelectProps } = useDebouncedSelect({
    control: managerForm.control,
    name: "departmentId",
    useGetDataQuery: useGetDepartmentsQuery,
    labelField: "name",
  });

  const { data, isFetching, refetch } = useGetManagersQuery(searchParams);
  const [createManager, { isLoading: isCreating }] = useCreateUserMutation();
  const [deleteManager, { isLoading: isDeleting }] = useDeleteUserMutation();

  const { current, pageSize } = pagination;

  const handleViewManager = (id: string) => {
    router.push(NAV_LINK.USER_DETAIL_OVERVIEW(id));
  };

  const tableColumns = useMemo(() => {
    return columnsTitles.map((item, index) => {
      if (item.dataIndex === "method") {
        return {
          ...item,
          render: (record: IUser) => {
            return (
              <ManagerActions
                record={record}
                onEdit={handleEditManager}
                onDelete={handleDeleteManager}
                onView={handleViewManager}
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

  const onSubmitSearch = (formData: {
    search?: string;
    roleName?: string;
    status?: string;
  }) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      page: 1, // Reset to first page on new search
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

  const handleEditManager = (id: string) => {
    router.push(NAV_LINK.USER_DETAIL_SETTINGS(id));
  };

  const handleDeleteManager = (id: string) => {
    Modal.confirm({
      title: "Delete Manager",
      content: "Are you sure you want to delete this manager?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteManager(id).unwrap();
          toast.success("Manager deleted successfully");
          refetch();
        } catch (error) {
          // Handled by the apiErrorMiddleware
        }
      },
    });
  };

  const onSubmitCreate = async (data: ManagerFormValues) => {
    try {
      // Only create new manager
      await createManager(data).unwrap();
      toast.success("Manager created successfully");

      handleCloseDrawer();
      refetch();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCloseDrawer = () => {
    dispatch(closeCreateModal());
    // Reset form to default values
    managerForm.reset({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      roleName: RoleName.MANAGE,
      status: UserStatus.ACTIVE,
      departmentId: "",
    });
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
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MANAGER_LIST}>
      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-4">
            <FilterGrid>
              <CustomInput
                control={searchForm.control}
                name="search"
                size="large"
                placeholder="Search by name, email or code"
              />
              <CustomSelect
                control={searchForm.control}
                name="roleName"
                size="large"
                placeholder="Filter by role"
                options={ManagerRoleOptions}
              />
              <CustomSelect
                control={searchForm.control}
                name="status"
                size="large"
                placeholder="Filter by status"
                options={StatusOptions}
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
                title="Add Manager"
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
        <CustomDrawer
          title="Add Manager"
          open={isOpenCreateModal}
          onCancel={handleCloseDrawer}
          onSubmit={managerForm.handleSubmit(onSubmitCreate)}
          loading={isCreating}
        >
          <form className="flex flex-col gap-4">
            <CustomInput
              control={managerForm.control}
              name="firstName"
              label="First Name"
              size="large"
              placeholder="Enter first name"
            />
            <CustomInput
              control={managerForm.control}
              name="lastName"
              label="Last Name"
              size="large"
              placeholder="Enter last name"
            />
            <CustomInput
              control={managerForm.control}
              name="email"
              label="Email"
              size="large"
              placeholder="Enter email"
            />
            <CustomInput
              control={managerForm.control}
              name="password"
              label="Password"
              size="large"
              placeholder="Enter password"
              type="password"
            />
            <CustomInput
              control={managerForm.control}
              name="confirmPassword"
              label="Confirm Password"
              size="large"
              placeholder="Confirm password"
              type="password"
            />
            <CustomInput
              control={managerForm.control}
              name="phoneNumber"
              label="Phone Number"
              size="large"
              placeholder="Enter phone number"
            />

            {/* Department selection */}
            <CustomSelect
              control={managerForm.control}
              name="departmentId"
              label="Department"
              size="large"
              placeholder="Select department"
              options={departmentSelectProps.options}
              onFocus={departmentSelectProps.onFocus}
              onPopupScroll={departmentSelectProps.onPopupScroll}
            />

            <CustomSelect
              control={managerForm.control}
              name="roleName"
              label="Role"
              size="large"
              placeholder="Select role"
              options={ManagerRoleOptions}
            />
            <CustomSelect
              control={managerForm.control}
              name="status"
              label="Status"
              size="large"
              placeholder="Select status"
              options={StatusOptions}
            />
          </form>
        </CustomDrawer>
      </div>
    </PageLayout>
  );
};

export default ManagerList;
