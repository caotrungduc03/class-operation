"use client";
import { PlusOutlined } from "@ant-design/icons";
import CustomButton from "@web/components/common/CustomButton";
import CustomInput from "@web/components/common/CustomInput";
import FilterGrid from "@web/components/common/FilterGrid";
import TableAction from "@web/components/table/TeacherAction";
import { NAV_TITLE } from "@web/constants/nav";
import PageLayout from "@web/layouts/PageLayout";
import { openCreateModal } from "@web/libs/features/table/tableSlice";
import { useGetTeachersQuery } from "@web/libs/features/teachers/teacherApi";
import { TableColumn } from "@web/types/common";
import { IUser } from "@web/types/user";
import { Card, Table, TablePaginationConfig } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

const breadcrumbs: ItemType[] = [
  {
    href: "#",
    title: NAV_TITLE.USER_LIST,
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

const Teachers = () => {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultCurrent: 1,
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [searchParams, setSearchParams] = useState<{ search?: string }>({});
  const dispatch = useDispatch();

  const { data, isLoading, refetch } = useGetTeachersQuery(searchParams);
  const { control, handleSubmit, reset: resetForm } = useForm();
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

  const onSubmit = (formData: { search?: string }) => {
    setSearchParams(formData);
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleReset = () => {
    resetForm();
    setSearchParams({});
    setPagination({
      ...pagination,
      current: 1,
    });
    refetch();
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.TEACHER_LIST}>
      <div className="flex flex-col gap-6">
        <Card>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FilterGrid>
              <CustomInput
                control={control}
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
                  onClick={handleSubmit(onSubmit)}
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
          </form>
        </Card>
        <Card>
          <Table
            loading={isLoading}
            rowKey={(record) => record.id}
            columns={tableColumns}
            dataSource={tableData}
            scroll={{ x: "max-content" }}
            pagination={pagination}
            onChange={setPagination}
          />
        </Card>
      </div>
    </PageLayout>
  );
};

export default Teachers;
