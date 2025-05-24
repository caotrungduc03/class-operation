"use client";
import { PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTooltip from "@web/components/common/CustomTooltip";
import FilterGrid from "@web/components/common/FilterGrid";
import { useDebouncedSelect } from "@web/hooks/useDebouncedSelect";
import PageLayout from "@web/layouts/PageLayout";
import { DATE_TIME_FORMAT, TableColumn } from "@web/libs/common";
import { useGetDepartmentsQuery } from "@web/libs/features/departments/departmentApi";
import { useGetFieldsQuery } from "@web/libs/features/fields/fieldApi";
import {
  closeCreateModal,
  openCreateModal,
} from "@web/libs/features/table/tableSlice";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetTeachersQuery,
} from "@web/libs/features/users/userApi";
import { NAV_LINK, NAV_TITLE } from "@web/libs/nav";
import {
  ROLE_LABEL,
  ROLE_TAG,
  RoleName,
  TeacherRoleOptions,
} from "@web/libs/role";
import { RootState } from "@web/libs/store";
import {
  IDetailUser,
  IRole,
  IUser,
  STATUS_LABEL,
  STATUS_TAG,
  StatusOptions,
  TeacherLevel,
  TeacherLevelOptions,
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
    title: NAV_TITLE.TEACHER_LIST,
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
    title: "Teacher Type",
    dataIndex: "role",
    render: (role: IRole) => (
      <Tag color={ROLE_TAG[role.roleName]}>{ROLE_LABEL[role.roleName]}</Tag>
    ),
  },
  {
    title: "Field",
    dataIndex: "detail",
    render: (detail: IDetailUser) => detail?.field?.name,
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

// Define Zod schema for teacher form validation
const teacherFormSchema = z
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
    status: z.nativeEnum(UserStatus).optional(),
    departmentId: z.string().optional(),
    fieldId: z.string().optional(),
    teacherLevel: z.nativeEnum(TeacherLevel, {
      required_error: "Teacher level is required",
    }),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Define type from schema
type TeacherFormValues = z.infer<typeof teacherFormSchema>;

const TeacherActions = ({
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

const Teachers = () => {
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

  // Teacher form with validation
  const teacherForm = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      roleName: RoleName.TEACHER_FULL_TIME,
      status: UserStatus.ACTIVE,
      departmentId: "",
      fieldId: "",
      teacherLevel: TeacherLevel.A1,
    },
  });

  // Use debounced select hooks for departments and fields
  const { selectProps: departmentSelectProps } = useDebouncedSelect({
    control: teacherForm.control,
    name: "departmentId",
    useGetDataQuery: useGetDepartmentsQuery,
    labelField: "name",
  });

  const { selectProps: fieldSelectProps } = useDebouncedSelect({
    control: teacherForm.control,
    name: "fieldId",
    useGetDataQuery: useGetFieldsQuery,
    labelField: "name",
  });

  const { data, isFetching, refetch } = useGetTeachersQuery(searchParams);
  const [createTeacher, { isLoading: isCreating }] = useCreateUserMutation();
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteUserMutation();

  const { current, pageSize } = pagination;

  const tableColumns = useMemo(() => {
    return columnsTitles.map((item, index) => {
      if (item.dataIndex === "method") {
        return {
          ...item,
          render: (record: IUser) => {
            return (
              <TeacherActions
                record={record}
                onEdit={handleEditTeacher}
                onDelete={handleDeleteTeacher}
                onView={handleViewTeacher}
              />
            );
          },
          key: index,
        };
      }
      if (item.dataIndex === "fullName") {
        return {
          ...item,
          render: (fullName: string, record: IUser) => (
            <CustomTooltip title={fullName}>
              <span 
                className="cursor-pointer text-blue-500 hover:text-blue-700"
                onClick={() => handleViewTeacher(record.id)}
              >
                {fullName}
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

  const handleEditTeacher = (id: string) => {
    router.push(NAV_LINK.USER_DETAIL_SETTINGS(id));
  };

  const handleDeleteTeacher = (id: string) => {
    Modal.confirm({
      title: "Delete Teacher",
      content: "Are you sure you want to delete this teacher?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteTeacher(id).unwrap();
          toast.success("Teacher deleted successfully");
          refetch();
        } catch (error) {
          // Handled by the apiErrorMiddleware
        }
      },
    });
  };

  const handleViewTeacher = (id: string) => {
    router.push(NAV_LINK.USER_DETAIL_OVERVIEW(id));
  };

  const onSubmitCreate = async (data: TeacherFormValues) => {
    try {
      // Only create new teacher
      await createTeacher(data).unwrap();
      toast.success("Teacher created successfully");

      handleCloseDrawer();
      refetch();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCloseDrawer = () => {
    dispatch(closeCreateModal());
    teacherForm.reset({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      roleName: RoleName.TEACHER_FULL_TIME,
      status: UserStatus.ACTIVE,
      departmentId: "",
      fieldId: "",
      teacherLevel: TeacherLevel.A1,
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
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.TEACHER_LIST}>
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
                placeholder="Filter by teacher type"
                options={TeacherRoleOptions}
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
                title="Add Teacher"
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

      <CustomDrawer
        title="Add Teacher" // Always "Add Teacher", never "Edit Teacher"
        open={isOpenCreateModal}
        onCancel={handleCloseDrawer}
        onSubmit={teacherForm.handleSubmit(onSubmitCreate)}
        loading={isCreating}
      >
        <div className="flex flex-col gap-4">
          <CustomInput
            control={teacherForm.control}
            name="firstName"
            label="First Name"
            placeholder="Enter first name"
            required
          />

          <CustomInput
            control={teacherForm.control}
            name="lastName"
            label="Last Name"
            placeholder="Enter last name"
            required
          />

          <CustomInput
            control={teacherForm.control}
            name="email"
            label="Email"
            placeholder="Enter email"
            required
            autoComplete="off"
          />

          <CustomInput
            control={teacherForm.control}
            name="password"
            label="Password"
            placeholder="Enter password"
            type="password"
            required
            autoComplete="new-password"
          />

          <CustomInput
            control={teacherForm.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm password"
            type="password"
            required
            autoComplete="new-password"
          />

          <CustomInput
            control={teacherForm.control}
            name="phoneNumber"
            label="Phone Number"
            placeholder="Enter phone number (optional)"
          />

          {/* Department selection */}
          <CustomSelect
            control={teacherForm.control}
            name="departmentId"
            label="Department"
            placeholder="Select department"
            options={departmentSelectProps.options}
            onFocus={departmentSelectProps.onFocus}
            onPopupScroll={departmentSelectProps.onPopupScroll}
          />

          {/* Field selection - specific to teachers */}
          <CustomSelect
            control={teacherForm.control}
            name="fieldId"
            label="Field"
            placeholder="Select field"
            options={fieldSelectProps.options}
            onFocus={fieldSelectProps.onFocus}
            onPopupScroll={fieldSelectProps.onPopupScroll}
          />

          {/* Teacher level selection */}
          <CustomSelect
            control={teacherForm.control}
            name="teacherLevel"
            label="Teacher Level"
            placeholder="Select teacher level"
            options={TeacherLevelOptions}
            required
          />

          <CustomSelect
            control={teacherForm.control}
            name="roleName"
            label="Teacher Type"
            placeholder="Select teacher type"
            options={TeacherRoleOptions}
            required
          />

          <CustomSelect
            control={teacherForm.control}
            name="status"
            label="Status"
            placeholder="Select status"
            options={StatusOptions}
            required
          />
        </div>
      </CustomDrawer>
    </PageLayout>
  );
};

export default Teachers;
