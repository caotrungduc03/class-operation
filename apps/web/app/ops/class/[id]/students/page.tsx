"use client";
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import FilterGrid from "@web/components/common/FilterGrid";
import Loading from "@web/components/common/Loading";
import { TableColumn } from "@web/libs/common";
import {
  useAddStudentToClassMutation,
  useGetClassStudentsQuery,
  useRemoveStudentFromClassMutation,
} from "@web/libs/features/classes/classApi";
import { IUser, STATUS_LABEL, STATUS_TAG, UserStatus } from "@web/libs/user";
import { Card, Modal, Table, Tag, Typography } from "antd";
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
    title: "Họ và tên",
    dataIndex: "fullName",
    render: (item, record) => (
      <div className="flex items-center gap-3">
        {record.avatar ? (
          <Image
            src={record.avatar}
            alt={record.fullName}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            {record.fullName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <Typography.Text strong>{record.fullName}</Typography.Text>
          <div>
            <Typography.Text type="secondary">{record.email}</Typography.Text>
          </div>
        </div>
      </div>
    ),
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
}: {
  record: IUser;
  onRemove: (id: string) => void;
}) => {
  return (
    <CustomButton
      color="danger"
      icon={<DeleteOutlined />}
      onClick={() => onRemove(record.id)}
      title="Remove"
    />
  );
};

const ClassStudents = () => {
  const { id: classId } = useParams<{ id: string }>();
  const [searchText, setSearchText] = useState("");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
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

  const { data: availableStudentsData } = useGetClassStudentsQuery({
    classId,
    page: 1,
    limit: 100,
  });

  const [addStudent, { isLoading: isAddingStudent }] =
    useAddStudentToClassMutation();
  const [removeStudent, { isLoading: isRemovingStudent }] =
    useRemoveStudentFromClassMutation();

  // Setup forms with zod resolver
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
  });

  const addStudentForm = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentFormSchema),
  });

  // Format available students for dropdown
  const availableStudentOptions =
    availableStudentsData?.data?.items
      .filter((student) => {
        // Filter out students already in the class
        const classStudents = studentsData?.data?.items || [];
        return !classStudents.some((cs) => cs.id === student.id);
      })
      .map((student) => ({
        label: `${student.fullName} (${student.email})`,
        value: student.id,
      })) || [];

  // Map the columns with actions
  const tableColumns = columnsTitles.map((item, index) => {
    if (item.dataIndex === "method") {
      return {
        ...item,
        key: index,
        render: (_, record) => (
          <StudentActions record={record} onRemove={setStudentToRemove} />
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
            size="large"
            onClick={searchForm.handleSubmit(onSubmitSearch)}
          />
        </FilterGrid>

        <Table
          columns={tableColumns}
          dataSource={(studentsData?.data?.items || []).map((item) => ({
            ...item,
            method: item,
          }))}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: studentsData?.data?.total || 0,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
          }}
        />
      </div>

      {/* Add Student Drawer */}
      <CustomDrawer
        title="Add Student to Class"
        open={isAddDrawerOpen}
        onCancel={handleCloseAddDrawer}
        onSubmit={addStudentForm.handleSubmit(handleAddStudent)}
        loading={isAddingStudent}
      >
        <div className="flex flex-col gap-4">
          <CustomSelect
            control={addStudentForm.control}
            name="studentId"
            label="Select Student"
            placeholder="Select a student"
            options={availableStudentOptions}
            required
          />
        </div>
      </CustomDrawer>

      {/* Remove Student Confirmation */}
      <ConfirmModal
        title="Remove Student"
        content="Are you sure you want to remove this student from the class?"
        open={!!studentToRemove}
        onCancel={() => setStudentToRemove(null)}
        onConfirm={handleConfirmRemove}
        confirmLoading={isRemovingStudent}
      />
    </Card>
  );
};

// Define the ConfirmModal component
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
      confirmLoading={confirmLoading}
      onOk={onConfirm}
      okText="Confirm"
      cancelText="Cancel"
    >
      <p>{content}</p>
    </Modal>
  );
};

export default ClassStudents;
