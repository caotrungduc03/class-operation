"use client";
import { PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomDropdown from "@web/components/common/CustomDropdown";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTextArea from "@web/components/common/CustomTextArea";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import { TableColumn } from "@web/libs/common";
import { CourseType, CreateCourseDto, ICourse } from "@web/libs/course";
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
  useLazyGetCourseByIdQuery,
  useUpdateCourseMutation,
} from "@web/libs/features/courses/courseApi";
import {
  closeCreateModal,
  openCreateModal,
} from "@web/libs/features/table/tableSlice";
import { NAV_TITLE } from "@web/libs/nav";
import { RootState } from "@web/libs/store";
import { STATUS_LABEL, StatusOptions, UserStatus } from "@web/libs/user";
import { Card, Modal, Table, TablePaginationConfig } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.MANAGE_COURSES,
  },
];

const columnsTitles: TableColumn<ICourse>[] = [
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
    title: "Description",
    dataIndex: "description",
  },
  {
    title: "Type",
    dataIndex: "type",
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: UserStatus) => STATUS_LABEL[status],
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
    fixed: "right",
  },
];

// Define Zod schema for course form validation
const courseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.nativeEnum(CourseType, { required_error: "Type is required" }),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED]).optional(),
});

// Create type from Zod schema
type CourseFormValues = z.infer<typeof courseFormSchema>;

const courseTypeOptions = Object.entries(CourseType).map(([label, value]) => ({
  label,
  value,
}));

const CourseActions = ({
  record,
  onEdit,
  onDelete,
}: {
  record: ICourse;
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

const Courses = () => {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultCurrent: 1,
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [searchParams, setSearchParams] = useState<{
    name?: string;
    page?: number;
    limit?: number;
  }>({
    page: 1,
    limit: 10,
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { isOpenCreateModal } = useSelector((state: RootState) => state.table);
  const dispatch = useDispatch();

  // Search form
  const searchForm = useForm();

  // Course form with validation
  const courseForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: undefined,
      status: UserStatus.ACTIVE,
    },
  });

  const { data, isFetching, refetch } = useGetCoursesQuery(searchParams);
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();

  // Use the lazy version of the query
  const [getCourseById, { isFetching: isLoadingCourse }] =
    useLazyGetCourseByIdQuery();

  const { current, pageSize } = pagination;

  const tableColumns = useMemo(() => {
    return columnsTitles.map((item, index) => {
      if (item.dataIndex === "method") {
        return {
          ...item,
          render: (record: ICourse) => {
            return (
              <CourseActions
                record={record}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
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

  const onSubmitSearch = (formData: { name?: string }) => {
    setSearchParams({
      ...searchParams,
      name: formData.name,
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

  const handleEditCourse = (id: string) => {
    setSelectedCourseId(id);
    setIsEditMode(true);

    // Use the lazy query to get course data
    getCourseById(id)
      .unwrap()
      .then((response) => {
        if (response?.data) {
          const course = response.data;
          courseForm.reset({
            name: course.name,
            description: course.description,
            type: course.type,
            status: course.status,
          });
          dispatch(openCreateModal());
        }
      })
      .catch((error) => {
        // Error handling
      });
  };

  const handleDeleteCourse = (id: string) => {
    Modal.confirm({
      title: "Delete Course",
      content: "Are you sure you want to delete this course?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteCourse(id).unwrap();
          toast.success("Course deleted successfully");
          refetch();
        } catch (error) {
          // Handled by the apiErrorMiddleware
        }
      },
    });
  };

  const onSubmitCourse = async (formData: CourseFormValues) => {
    try {
      // Convert formData to match the CreateCourseDto structure
      const courseData: CreateCourseDto = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
      };

      if (isEditMode && selectedCourseId) {
        await updateCourse({ id: selectedCourseId, data: courseData }).unwrap();
        toast.success("Course updated successfully");
      } else {
        await createCourse(courseData).unwrap();
        toast.success("Course created successfully");
      }
      handleCloseDrawer();
      refetch();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCloseDrawer = () => {
    dispatch(closeCreateModal());
    courseForm.reset();
    setIsEditMode(false);
    setSelectedCourseId(null);
  };

  const handlePaginationChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
    setSearchParams({
      ...searchParams,
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  const handleAddCourse = () => {
    setIsEditMode(false);
    courseForm.reset({
      name: "",
      description: "",
      type: undefined,
      status: UserStatus.ACTIVE,
    });
    dispatch(openCreateModal());
  };

  return (
    <PageLayout
      breadcrumbs={breadcrumbs}
      title={NAV_TITLE.MANAGE_COURSES || "Manage Courses"}
    >
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
                title="Add Course"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAddCourse}
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
        title={isEditMode ? "Edit Course" : "Add Course"}
        open={isOpenCreateModal}
        onCancel={handleCloseDrawer}
        onSubmit={courseForm.handleSubmit(onSubmitCourse)}
        loading={isCreating || isUpdating || isLoadingCourse}
      >
        <div className="flex flex-col gap-4">
          <CustomInput
            control={courseForm.control}
            name="name"
            label="Course Name"
            placeholder="Enter course name"
            required
          />

          <CustomSelect
            control={courseForm.control}
            name="type"
            label="Course Type"
            placeholder="Select course type"
            options={courseTypeOptions}
            required
          />

          <CustomTextArea
            control={courseForm.control}
            name="description"
            label="Description"
            placeholder="Enter course description"
          />

          <CustomSelect
            control={courseForm.control}
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

export default Courses;
