"use client";
import {
  DeleteOutlined,
  LockOutlined,
  PlusOutlined,
  SearchOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import FilterGrid from "@web/components/common/FilterGrid";
import Loading from "@web/components/common/Loading";
import { useDebouncedSelect } from "@web/hooks/useDebouncedSelect";
import { TableColumn } from "@web/libs/common";
import {
  useAddStudentToClassMutation,
  useGetAvailableStudentsQuery,
  useGetClassStudentsQuery,
  useRemoveStudentFromClassMutation,
} from "@web/libs/features/classes/classApi";
import { useUpdateUserStatusMutation } from "@web/libs/features/users/userApi";
import {
  IDetailUser,
  IUser,
  STATUS_LABEL,
  STATUS_TAG,
  UserStatus,
} from "@web/libs/user";
import { Button, Card, Modal, Table, Tag, Typography } from "antd";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

// Define validation schemas
const searchFormSchema = z.object({
  search: z.string().optional(),
});

const addStudentFormSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
});

// Define types based on the schemas
type SearchFormValues = z.infer<typeof searchFormSchema>;
type AddStudentFormValues = z.infer<typeof addStudentFormSchema>;

const columnsTitles: TableColumn<IUser>[] = [
  {
    title: "STT",
    dataIndex: "index",
    render: (_, __, index) => index + 1,
  },
  {
    title: "Mã học viên",
    dataIndex: "detail",
    render: (detail: IDetailUser) => detail.code,
  },
  {
    title: "Avatar",
    dataIndex: "avatar",
    render: (avatar: string, record) =>
      avatar ? (
        <Image
          src={avatar}
          alt={record.fullName}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          {record.fullName.charAt(0).toUpperCase()}
        </div>
      ),
  },
  {
    title: "Họ và tên",
    dataIndex: "fullName",
  },
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: UserStatus) => (
      <Tag color={STATUS_TAG[status]}>{STATUS_LABEL[status]}</Tag>
    ),
  },
  {
    title: "Actions",
    key: "actions",
    dataIndex: "method",
  },
];

const StudentActions = ({
  record,
  onRemove,
  onToggleStatus,
}: {
  record: IUser;
  onRemove: (id: string) => void;
  onToggleStatus: (id: string, status: UserStatus) => void;
}) => {
  return (
    <CustomDropdown>
      {record.status === UserStatus.ACTIVE ? (
        <CustomButton
          type="link"
          icon={<LockOutlined />}
          onClick={() => onToggleStatus(record.id, UserStatus.BLOCKED)}
          title="Block"
        />
      ) : (
        <CustomButton
          type="link"
          icon={<UnlockOutlined />}
          onClick={() => onToggleStatus(record.id, UserStatus.ACTIVE)}
          title="Unblock"
        />
      )}
      <CustomButton
        type="link"
        title="Remove"
        color="danger"
        icon={<DeleteOutlined />}
        onClick={() => onRemove(record.id)}
      />
    </CustomDropdown>
  );
};

const ClassStudents = () => {
  const { id: classId } = useParams<{ id: string }>();
  const [searchText, setSearchText] = useState("");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
  const [studentToToggleStatus, setStudentToToggleStatus] = useState<{
    id: string;
    status: UserStatus;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: studentsData,
    isLoading,
    refetch,
  } = useGetClassStudentsQuery(
    {
      classId,
      page: currentPage,
      limit: pageSize,
      search: searchText || undefined,
    },
    {
      skip: !classId,
    },
  );

  // Setup forms with zod resolver
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
  });

  const addStudentForm = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentFormSchema),
  });

  // Use debounced select for available students
  const {
    selectProps: { options: availableStudentOptions, onFocus, onPopupScroll },
  } = useDebouncedSelect({
    control: addStudentForm.control,
    name: "studentId",
    useGetDataQuery: useGetAvailableStudentsQuery,
    labelField: "fullName",
    queryArgs: {
      classId,
    },
  });

  const [addStudent, { isLoading: isAddingStudent }] =
    useAddStudentToClassMutation();
  const [removeStudent, { isLoading: isRemovingStudent }] =
    useRemoveStudentFromClassMutation();
  const [updateUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusMutation();

  // Map the columns with actions
  const tableColumns = columnsTitles.map((item, index) => {
    if (item.dataIndex === "method") {
      return {
        ...item,
        key: index,
        render: (_, record) => (
          <StudentActions
            record={record}
            onRemove={setStudentToRemove}
            onToggleStatus={(id, status) =>
              setStudentToToggleStatus({ id, status })
            }
          />
        ),
      };
    }
    return {
      ...item,
      key: index,
    };
  });

  // Event handlers
  const onSubmitSearch = (data: SearchFormValues) => {
    setSearchText(data.search || "");
    setCurrentPage(1);
  };

  const handleOpenAddDrawer = () => {
    addStudentForm.reset();
    setIsAddDrawerOpen(true);
  };

  const handleCloseAddDrawer = () => {
    setIsAddDrawerOpen(false);
  };

  const handleAddStudent = async (data: AddStudentFormValues) => {
    try {
      await addStudent({
        classId,
        studentId: data.studentId,
      }).unwrap();
      toast.success("Student added successfully");
      setIsAddDrawerOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to add student");
    }
  };

  const handleConfirmRemove = async () => {
    if (!studentToRemove) return;

    try {
      await removeStudent({
        classId,
        studentId: studentToRemove,
      }).unwrap();
      toast.success("Student removed successfully");
      setStudentToRemove(null);
      refetch();
    } catch (error) {
      toast.error("Failed to remove student");
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!studentToToggleStatus) return;

    try {
      await updateUserStatus({
        id: studentToToggleStatus.id,
        status: studentToToggleStatus.status,
      }).unwrap();

      const statusText =
        studentToToggleStatus.status === UserStatus.ACTIVE
          ? "unblocked"
          : "blocked";

      toast.success(`Student ${statusText} successfully`);
      setStudentToToggleStatus(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update student status");
    }
  };

  const handleTablePagination = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading && !studentsData) return <Loading />;

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">
            Class Students
          </Typography.Title>
          <CustomButton
            type="primary"
            title="Add Student"
            icon={<PlusOutlined />}
            onClick={handleOpenAddDrawer}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <FilterGrid>
          <CustomInput
            control={searchForm.control}
            name="search"
            placeholder="Search by name or email"
            size="large"
          />
          <CustomButton
            icon={<SearchOutlined />}
            type="primary"
            title="Search"
            onClick={searchForm.handleSubmit(onSubmitSearch)}
          />
        </FilterGrid>

        <Table
          dataSource={studentsData?.data?.items || []}
          columns={tableColumns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: studentsData?.data?.total || 0,
            pageSize,
            current: currentPage,
            onChange: handleTablePagination,
            showSizeChanger: false,
          }}
        />
      </div>

      {/* Add Student Drawer */}
      <CustomDrawer
        title="Add Student"
        open={isAddDrawerOpen}
        onCancel={handleCloseAddDrawer}
        onSubmit={addStudentForm.handleSubmit(handleAddStudent)}
        loading={isAddingStudent}
      >
        <div className="flex flex-col gap-4">
          <CustomSelect
            control={addStudentForm.control}
            name="studentId"
            label="Student"
            placeholder="Select student"
            options={availableStudentOptions}
            onFocus={onFocus}
            onPopupScroll={onPopupScroll}
            required
          />
        </div>
      </CustomDrawer>

      {/* Remove Confirmation Modal */}
      <ConfirmModal
        title="Remove Student"
        content="Are you sure you want to remove this student from the class?"
        open={!!studentToRemove}
        onCancel={() => setStudentToRemove(null)}
        onConfirm={handleConfirmRemove}
        confirmLoading={isRemovingStudent}
      />

      {/* Toggle Status Confirmation Modal */}
      <ConfirmModal
        title={`${studentToToggleStatus?.status === UserStatus.ACTIVE ? "Unblock" : "Block"} Student`}
        content={`Are you sure you want to ${studentToToggleStatus?.status === UserStatus.ACTIVE ? "unblock" : "block"} this student?`}
        open={!!studentToToggleStatus}
        onCancel={() => setStudentToToggleStatus(null)}
        onConfirm={handleConfirmToggleStatus}
        confirmLoading={isUpdatingStatus}
      />
    </Card>
  );
};

interface ConfirmModalProps {
  title: string;
  content: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLoading?: boolean;
}

const ConfirmModal = ({
  title,
  content,
  open,
  onCancel,
  onConfirm,
  confirmLoading = false,
}: ConfirmModalProps) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          loading={confirmLoading}
          onClick={onConfirm}
        >
          Confirm
        </Button>,
      ]}
    >
      <p>{content}</p>
    </Modal>
  );
};

export default ClassStudents;
