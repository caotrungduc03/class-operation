"use client";
import { SearchOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomInput from "@web/components/common/CustomInput";
import FilterGrid from "@web/components/common/FilterGrid";
import Loading from "@web/components/common/Loading";
import { TableColumn } from "@web/libs/common";
import { useGetClassStudentsQuery } from "@web/libs/features/classes/classApi";
import { IStudentClass } from "@web/libs/student-class";
import { IUser, STATUS_LABEL, STATUS_TAG, UserStatus } from "@web/libs/user";
import { Card, Table, Tag, Typography } from "antd";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define validation schemas
const searchFormSchema = z.object({
  search: z.string().optional(),
});

// Define types based on the schemas
type SearchFormValues = z.infer<typeof searchFormSchema>;

const columnsTitles: TableColumn<IStudentClass>[] = [
  {
    title: "STT",
    dataIndex: "index",
    render: (_, __, index) => index + 1,
  },
  {
    title: "Mã học viên",
    dataIndex: "student",
    render: (student: IUser) => student.detail.code,
  },
  {
    title: "Avatar",
    dataIndex: "student",
    render: (student: IUser) =>
      student.avatar ? (
        <Image
          src={student.avatar}
          alt={student.fullName}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          {student.fullName.charAt(0).toUpperCase()}
        </div>
      ),
  },
  {
    title: "Họ và tên",
    dataIndex: "student",
    render: (student: IUser) => student.fullName,
  },
  {
    title: "Email",
    dataIndex: "student",
    render: (student: IUser) => student.email,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: UserStatus) => (
      <Tag color={STATUS_TAG[status]}>{STATUS_LABEL[status]}</Tag>
    ),
  },
];

const ClassStudents = () => {
  const { id: classId } = useParams<{ id: string }>();
  const [searchText, setSearchText] = useState("");

  const { data: studentsData, isLoading } = useGetClassStudentsQuery(
    {
      classId,
    },
    {
      skip: !classId,
    },
  );

  // Setup forms with zod resolver
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
  });

  // Map the columns
  const tableColumns = columnsTitles.map((item, index) => {
    return {
      ...item,
      key: index,
    };
  });

  // Event handlers
  const onSubmitSearch = (data: SearchFormValues) => {
    setSearchText(data.search || "");
  };

  if (isLoading && !studentsData) return <Loading />;

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">
            Class Students
          </Typography.Title>
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
          dataSource={studentsData?.data || []}
          columns={tableColumns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </div>
    </Card>
  );
};

export default ClassStudents;
