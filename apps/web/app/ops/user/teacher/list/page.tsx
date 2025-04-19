"use client";
import { PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomInput from "@web/components/common/CustomInput";
import FilterGrid from "@web/components/common/FilterGrid";
import TableAction from "@web/components/table/TeacherAction";
import PageLayout from "@web/layouts/PageLayout";
import { TableColumn } from "@web/libs/common";
import {
  closeCreateModal,
  openCreateModal,
} from "@web/libs/features/table/tableSlice";
import {
  useCreateUserMutation,
  useGetTeachersQuery,
} from "@web/libs/features/users/userApi";
import { NAV_TITLE } from "@web/libs/nav";
import { RoleName } from "@web/libs/role";
import { RootState } from "@web/libs/store";
import { IUser } from "@web/libs/user";
import { Card, Table, TablePaginationConfig } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
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
    render: (id: string) => {
      return <TableAction onEdit={() => {}} onDelete={() => {}} />;
    },
    fixed: "right",
  },
];

// Define Zod schema for teacher form validation
const teacherFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    phoneNumber: z.string().optional(),
    roleName: z.nativeEnum(RoleName, { required_error: "Role is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Teachers = () => {
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
  const { isOpenCreateModal } = useSelector((state: RootState) => state.table);
  const dispatch = useDispatch();

  // Search form
  const searchForm = useForm();

  // Teacher form with validation (no explicit type)
  const teacherForm = useForm({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      roleName: RoleName.TEACHER,
    },
  });

  const { data, isLoading, isFetching, refetch } =
    useGetTeachersQuery(searchParams);
  const [createTeacher, { isLoading: isCreating }] = useCreateUserMutation();
  const { current, pageSize } = pagination;

  const tableColumns = columnsTitles.map((item, index) => {
    return {
      ...item,
      key: index,
    };
  });

  const tableData = useMemo(() => {
    return (
      data?.data?.items.map((item, index) => ({
        ...item,
        index: ((current || 1) - 1) * (pageSize || 10) + index + 1,
        method: item.id,
      })) || []
    );
  }, [data, current, pageSize]);

  useEffect(() => {
    if (isLoading) return;

    refetch();
  }, [searchParams]);

  const onSubmitSearch = (formData: { search?: string }) => {
    setSearchParams({
      ...searchParams,
      search: formData.search,
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

  const onSubmitCreate = async (data) => {
    try {
      await createTeacher({
        ...data,
        roleName: RoleName.TEACHER,
      }).unwrap();

      toast.success("Teacher created successfully");
      handleCloseDrawer();
      refetch();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCloseDrawer = () => {
    dispatch(closeCreateModal());
    teacherForm.reset();
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
                placeholder="Please enter first name, last name or email"
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
        title="Add Teacher"
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
            autoComplete="new-email"
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
        </div>
      </CustomDrawer>
    </PageLayout>
  );
};

export default Teachers;
