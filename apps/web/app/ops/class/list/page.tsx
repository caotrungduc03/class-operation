"use client";
import { PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDatePicker from "@web/components/common/CustomDatePicker";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomInputNumber from "@web/components/common/CustomInputNumber";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTextArea from "@web/components/common/CustomTextArea";
import CustomTooltip from "@web/components/common/CustomTooltip";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import { CreateClassDto, IClass } from "@web/libs/class";
import { TableColumn } from "@web/libs/common";
import { ICourse } from "@web/libs/course";
import {
  useCreateClassMutation,
  useDeleteClassMutation,
  useGetClassesQuery,
} from "@web/libs/features/classes/classApi";
import { useGetCoursesQuery } from "@web/libs/features/courses/courseApi";
import {
  closeCreateModal,
  openCreateModal,
} from "@web/libs/features/table/tableSlice";
import { NAV_TITLE } from "@web/libs/nav";
import { IRoom } from "@web/libs/room";
import { RootState } from "@web/libs/store";
import { IUser, STATUS_LABEL, StatusOptions, UserStatus } from "@web/libs/user";
import { Card, Modal, Table, TablePaginationConfig } from "antd";
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
    title: NAV_TITLE.MANAGE_CLASSES,
  },
];

const columnsTitles: TableColumn<IClass>[] = [
  {
    title: "#",
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
    title: "Teacher",
    dataIndex: "teacher",
    render: (teacher: IUser) => teacher?.fullName || "",
  },
  {
    title: "Room",
    dataIndex: "room",
    render: (room: IRoom) => room?.name || "",
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
    title: "Quantity",
    dataIndex: "quantity",
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: UserStatus) => STATUS_LABEL[status],
  },
  {
    title: "",
    dataIndex: "method",
    fixed: "right",
  },
];

// Define Zod schema for class form validation
const classFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  startDate: z.any().refine((val) => !!val, "Start date is required"),
  endDate: z.any().refine((val) => !!val, "End date is required"),
  quantity: z.number().int().nonnegative().optional(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED]).optional(),
  courseId: z
    .string({
      message: "Course is required",
    })
    .min(1, "Course is required"),
  teacherId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
});

// Create type from Zod schema
type ClassFormValues = z.infer<typeof classFormSchema>;

const ClassActions = ({
  record,
  onEdit,
  onDelete,
}: {
  record: IClass;
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

const Classes = () => {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultCurrent: 1,
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [searchParams, setSearchParams] = useState<{
    name?: string;
    courseId?: string;
    teacherId?: string;
    status?: UserStatus;
    startDateFrom?: string;
    startDateTo?: string;
    page?: number;
    limit?: number;
  }>({
    page: 1,
    limit: 10,
  });
  const { isOpenCreateModal } = useSelector((state: RootState) => state.table);
  const dispatch = useDispatch();
  const router = useRouter();

  // Search form
  const searchForm = useForm();

  // Class form with validation
  const classForm = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: null,
      endDate: null,
      quantity: 0,
      status: UserStatus.ACTIVE,
      courseId: undefined,
      teacherId: null,
      roomId: null,
    },
  });

  const { data: coursesData } = useGetCoursesQuery({ limit: 100 });
  const courseOptions = useMemo(() => {
    return (
      coursesData?.data?.items.map((course) => ({
        label: `${course.code} - ${course.name}`,
        value: course.id,
      })) || []
    );
  }, [coursesData]);

  const { data, isFetching, refetch } = useGetClassesQuery(searchParams);
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  const { current, pageSize } = pagination;

  const tableColumns = useMemo(() => {
    return columnsTitles.map((item, index) => {
      if (item.dataIndex === "method") {
        return {
          ...item,
          render: (record: IClass) => {
            return (
              <ClassActions
                record={record}
                onEdit={handleEditClass}
                onDelete={handleDeleteClass}
              />
            );
          },
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
                onClick={() => handleEditClass(record.id)}
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
        method: item,
      })) || []
    );
  }, [data, current, pageSize]);

  const onSubmitSearch = (formData: any) => {
    const { name, courseId, startDateFrom, startDateTo, status } = formData;

    const formattedStartDateFrom = startDateFrom
      ? dayjs(startDateFrom).format("YYYY-MM-DD")
      : undefined;

    const formattedStartDateTo = startDateTo
      ? dayjs(startDateTo).format("YYYY-MM-DD")
      : undefined;

    setSearchParams({
      ...searchParams,
      name,
      courseId,
      status,
      startDateFrom: formattedStartDateFrom,
      startDateTo: formattedStartDateTo,
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

  const handleEditClass = (id: string) => {
    // Navigate to edit page with the class ID
    router.push(`/ops/class/${id}`);
  };

  const handleDeleteClass = (id: string) => {
    Modal.confirm({
      title: "Delete Class",
      content: "Are you sure you want to delete this class?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteClass(id).unwrap();
          toast.success("Class deleted successfully");
          refetch();
        } catch (error) {
          // Handled by the apiErrorMiddleware
        }
      },
    });
  };

  const onSubmitClass = async (formData: ClassFormValues) => {
    try {
      // Format dates to ISO string format if they exist
      const startDate = formData.startDate
        ? dayjs(formData.startDate).format("YYYY-MM-DD")
        : undefined;

      const endDate = formData.endDate
        ? dayjs(formData.endDate).format("YYYY-MM-DD")
        : undefined;

      const createData: CreateClassDto = {
        name: formData.name,
        description: formData.description,
        startDate,
        endDate,
        quantity: formData.quantity,
        status: formData.status,
        courseId: formData.courseId,
        teacherId: formData.teacherId || undefined,
        roomId: formData.roomId || undefined,
      };

      await createClass(createData).unwrap();
      toast.success("Class created successfully");

      handleCloseDrawer();
      refetch();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCloseDrawer = () => {
    dispatch(closeCreateModal());
    classForm.reset();
  };

  const handlePaginationChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
    setSearchParams({
      ...searchParams,
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  const handleAddClass = () => {
    classForm.reset({
      name: "",
      description: "",
      startDate: null,
      endDate: null,
      quantity: 0,
      status: UserStatus.ACTIVE,
      courseId: undefined,
      teacherId: null,
      roomId: null,
    });
    dispatch(openCreateModal());
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MANAGE_CLASSES}>
      <div className="flex flex-col gap-6">
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
              <CustomDatePicker
                control={searchForm.control}
                name="startDateFrom"
                size="large"
                placeholder="Start Date From"
                required
              />
              <CustomDatePicker
                control={searchForm.control}
                name="startDateTo"
                size="large"
                placeholder="Start Date To"
                required
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
                title="Add Class"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAddClass}
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
        title={"Add Class"}
        open={isOpenCreateModal}
        onCancel={handleCloseDrawer}
        onSubmit={classForm.handleSubmit(onSubmitClass)}
        loading={isCreating}
      >
        <div className="flex flex-col gap-4">
          <CustomInput
            control={classForm.control}
            name="name"
            label="Class Name"
            placeholder="Enter class name"
            required
          />

          <CustomSelect
            control={classForm.control}
            name="courseId"
            label="Course"
            placeholder="Select course"
            options={courseOptions}
            required
          />

          <CustomDatePicker
            control={classForm.control}
            name="startDate"
            label="Start Date"
            placeholder="Select start date"
            required
          />

          <CustomDatePicker
            control={classForm.control}
            name="endDate"
            label="End Date"
            placeholder="Select end date"
            required
          />

          <CustomInputNumber
            control={classForm.control}
            name="quantity"
            label="Quantity"
            placeholder="Enter quantity"
          />

          <CustomTextArea
            control={classForm.control}
            name="description"
            label="Description"
            placeholder="Enter class description"
          />

          <CustomSelect
            control={classForm.control}
            name="status"
            label="Status"
            placeholder="Select status"
            options={StatusOptions}
          />
        </div>
      </CustomDrawer>
    </PageLayout>
  );
};

export default Classes;
