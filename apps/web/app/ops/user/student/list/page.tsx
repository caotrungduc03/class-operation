"use client";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import { DATE_TIME_FORMAT, TableColumn } from "@web/libs/common";
import {
    closeCreateModal,
    openCreateModal,
} from "@web/libs/features/table/tableSlice";
import {
    useCreateUserMutation,
    useDeleteUserMutation,
    useGetStudentsQuery,
} from "@web/libs/features/users/userApi";
import { NAV_LINK, NAV_TITLE } from "@web/libs/nav";
import { RoleName } from "@web/libs/role";
import { RootState } from "@web/libs/store";
import {
    IDetailUser,
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
    title: NAV_TITLE.STUDENT_LIST,
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

// Define Zod schema for student form validation
const studentFormSchema = z
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
    status: z.nativeEnum(UserStatus).optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Define type from schema
type StudentFormValues = z.infer<typeof studentFormSchema>;

const StudentActions = ({
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
        icon={<EyeOutlined />}
        onClick={() => onView(record.id)}
      />
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

const Students = () => {
  const router = useRouter();
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultCurrent: 1,
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [searchParams, setSearchParams] = useState<{
    search?: string;
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

  // Student form with validation
  const studentForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      status: UserStatus.ACTIVE,
    },
  });

  const { data, isFetching, refetch } = useGetStudentsQuery(searchParams);
  const [createStudent, { isLoading: isCreating }] = useCreateUserMutation();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteUserMutation();

  const { current, pageSize } = pagination;

  const tableColumns = useMemo(() => {
    return columnsTitles.map((item, index) => {
      if (item.dataIndex === "method") {
        return {
          ...item,
          render: (record: IUser) => {
            return (
              <StudentActions
                record={record}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
                onView={handleViewStudent}
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

  const onSubmitSearch = (formData: { search?: string; status?: string }) => {
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

  const handleEditStudent = (id: string) => {
    router.push(NAV_LINK.USER_DETAIL_SETTINGS(id));
  };

  const handleDeleteStudent = (id: string) => {
    Modal.confirm({
      title: "Delete Student",
      content: "Are you sure you want to delete this student?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteStudent(id).unwrap();
          toast.success("Student deleted successfully");
          refetch();
        } catch (error) {
          // Handled by the apiErrorMiddleware
        }
      },
    });
  };

  const handleViewStudent = (id: string) => {
    router.push(NAV_LINK.USER_DETAIL_OVERVIEW(id));
  };

  const onSubmitCreate = async (data: StudentFormValues) => {
    try {
      // Only create new student
      await createStudent({
        ...data,
        roleName: RoleName.STUDENT,
      }).unwrap();
      toast.success("Student created successfully");

      handleCloseDrawer();
      refetch();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCloseDrawer = () => {
    dispatch(closeCreateModal());
    studentForm.reset({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      status: UserStatus.ACTIVE,
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
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.STUDENT_LIST}>
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
                title="Add Student"
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
        title="Add Student"
        open={isOpenCreateModal}
        onCancel={handleCloseDrawer}
        onSubmit={studentForm.handleSubmit(onSubmitCreate)}
        loading={isCreating}
      >
        <div className="flex flex-col gap-4">
          <CustomInput
            control={studentForm.control}
            name="firstName"
            label="First Name"
            placeholder="Enter first name"
            required
          />

          <CustomInput
            control={studentForm.control}
            name="lastName"
            label="Last Name"
            placeholder="Enter last name"
            required
          />

          <CustomInput
            control={studentForm.control}
            name="email"
            label="Email"
            placeholder="Enter email"
            required
            autoComplete="off"
          />

          <CustomInput
            control={studentForm.control}
            name="password"
            label="Password"
            placeholder="Enter password"
            type="password"
            required
            autoComplete="new-password"
          />

          <CustomInput
            control={studentForm.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm password"
            type="password"
            required
            autoComplete="new-password"
          />

          <CustomInput
            control={studentForm.control}
            name="phoneNumber"
            label="Phone Number"
            placeholder="Enter phone number (optional)"
          />

          <CustomSelect
            control={studentForm.control}
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

export default Students;
