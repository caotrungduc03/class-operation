"use client";
import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTooltip from "@web/components/common/CustomTooltip";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import { IClass } from "@web/libs/class";
import { TableColumn } from "@web/libs/common";
import { ICourse } from "@web/libs/course";
import { useGetMyClassesQuery } from "@web/libs/features/classes/classApi";
import { useGetCoursesQuery } from "@web/libs/features/courses/courseApi";
import { NAV_LINK, NAV_TITLE } from "@web/libs/nav";
import { IRoom } from "@web/libs/room";
import {
  STATUS_LABEL,
  STATUS_TAG,
  StatusOptions,
  UserStatus,
} from "@web/libs/user";
import { Button, Card, Table, TablePaginationConfig, Tag } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.MY_TEACHER_CLASS,
  },
];

const searchSchema = z.object({
  name: z.string().optional(),
  courseId: z.string().optional(),
  status: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

const columnsTitles: TableColumn<IClass>[] = [
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
    title: "Course",
    dataIndex: "course",
    render: (course: ICourse) => course?.name,
  },
  {
    title: "Room",
    dataIndex: "room",
    render: (room: IRoom) => room?.name || "",
  },
  {
    title: "Students",
    dataIndex: "studentClasses",
    render: (_, record: IClass) =>
      `${record.studentClasses?.length || 0} / ${record.quantity}`,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: UserStatus) => (
      <Tag color={STATUS_TAG[status]}>{STATUS_LABEL[status]}</Tag>
    ),
  },
  {
    title: "Start Date",
    dataIndex: "startDate",
    render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
  },
  {
    title: "End Date",
    dataIndex: "endDate",
    render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
  },
  {
    title: "",
    dataIndex: "method",
    fixed: "right",
    width: 100,
  },
];

const MyClass = () => {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultCurrent: 1,
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    name: undefined,
    courseId: undefined,
    status: undefined,
  });
  const router = useRouter();

  // Search form
  const searchForm = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  // Get courses for filter dropdown
  const { data: coursesData } = useGetCoursesQuery({ limit: 100 });
  const courseOptions = useMemo(() => {
    return (
      coursesData?.data?.items.map((course) => ({
        label: `${course.code} - ${course.name}`,
        value: course.id,
      })) || []
    );
  }, [coursesData]);

  const { data, isFetching, refetch } = useGetMyClassesQuery(searchParams);

  const { current, pageSize } = pagination;

  const tableColumns = useMemo(() => {
    return columnsTitles.map((item, index) => {
      if (item.dataIndex === "method") {
        return {
          ...item,
          render: (_, record: IClass) => (
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewClass(record.id)}
            >
              View
            </Button>
          ),
          key: index,
        };
      }
      if (item.dataIndex === "name") {
        return {
          ...item,
          render: (name: string, record: IClass) => (
            <CustomTooltip title={name}>
              <span
                className="cursor-pointer text-blue-500 hover:text-blue-700"
                onClick={() => handleViewClass(record.id)}
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
        action: item,
      })) || []
    );
  }, [data, current, pageSize]);

  // Update pagination when data changes
  useEffect(() => {
    if (data?.data) {
      setPagination((prev) => ({
        ...prev,
        current: data.data.page || prev.current,
        pageSize: data.data.limit || prev.pageSize,
        total: data.data.total || 0,
      }));
    }
  }, [data]);

  const handleViewClass = (id: string) => {
    router.push(NAV_LINK.MY_TEACHER_CLASS_DETAIL_OVERVIEW(id));
  };

  const onSubmitSearch = (formData: SearchFormData) => {
    const { name, courseId, status } = formData;

    setSearchParams({
      ...searchParams,
      name,
      courseId,
      status,
      page: 1,
    });
  };

  const handleReset = () => {
    searchForm.reset();
    setSearchParams((prev) => ({
      ...prev,
      name: undefined,
      courseId: undefined,
      status: undefined,
      page: 1,
    }));
    setPagination({
      ...pagination,
      current: 1,
    });
    refetch();
  };

  const handlePaginationChange = (newPagination: TablePaginationConfig) => {
    setSearchParams({
      ...searchParams,
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MY_TEACHER_CLASS}>
      <div id="my-class-container" className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-4">
            <FilterGrid>
              <CustomInput
                control={searchForm.control}
                name="name"
                size="large"
                placeholder="Search by name or code"
              />
              <CustomSelect
                control={searchForm.control}
                name="courseId"
                size="large"
                placeholder="Filter by course"
                options={courseOptions}
              />
              <CustomSelect
                control={searchForm.control}
                name="status"
                size="large"
                placeholder="Filter by status"
                options={StatusOptions}
              />
            </FilterGrid>
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
    </PageLayout>
  );
};

export default MyClass;
