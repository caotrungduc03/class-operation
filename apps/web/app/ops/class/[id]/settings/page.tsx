"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDatePicker from "@web/components/common/CustomDatePicker";
import CustomInput from "@web/components/common/CustomInput";
import CustomInputNumber from "@web/components/common/CustomInputNumber";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTextArea from "@web/components/common/CustomTextArea";
import Loading from "@web/components/common/Loading";
import { UpdateClassDto } from "@web/libs/class";
import {
  useGetClassByIdQuery,
  useUpdateClassMutation,
} from "@web/libs/features/classes/classApi";
import { useGetCoursesQuery } from "@web/libs/features/courses/courseApi";
import { StatusOptions, UserStatus } from "@web/libs/user";
import { Card, Typography } from "antd";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

// Define Zod schema for class form validation
const classFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  startDate: z.any().optional(),
  endDate: z.any().optional(),
  quantity: z.number().int().nonnegative().optional(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED]).optional(),
  courseId: z.string().min(1, "Course is required"),
  teacherId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
});

// Create type from Zod schema
type ClassFormValues = z.infer<typeof classFormSchema>;

const ClassSettings = () => {
  const { id } = useParams();
  const classId = id as string;
  const router = useRouter();

  const {
    data: classData,
    isLoading,
    refetch,
  } = useGetClassByIdQuery(classId, {
    skip: !classId,
  });

  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const { data: coursesData } = useGetCoursesQuery({ limit: 100 });

  const classDetail = classData?.data;

  const courseOptions =
    coursesData?.data?.items.map((course) => ({
      label: `${course.code} - ${course.name}`,
      value: course.id,
    })) || [];

  const { control, handleSubmit, reset } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: null,
      endDate: null,
      quantity: 0,
      status: UserStatus.ACTIVE,
      courseId: "",
      teacherId: null,
      roomId: null,
    },
  });

  useEffect(() => {
    if (classDetail) {
      reset({
        name: classDetail.name,
        description: classDetail.description || "",
        startDate: classDetail.startDate ? dayjs(classDetail.startDate) : null,
        endDate: classDetail.endDate ? dayjs(classDetail.endDate) : null,
        quantity: classDetail.quantity || 0,
        status: classDetail.status,
        courseId: classDetail.courseId,
        teacherId: classDetail.teacherId || null,
        roomId: classDetail.roomId || null,
      });
    }
  }, [classDetail, reset]);

  const onSubmit = async (formData: ClassFormValues) => {
    try {
      // Format dates to ISO string format if they exist
      const startDate = formData.startDate
        ? dayjs(formData.startDate).format("YYYY-MM-DD")
        : undefined;

      const endDate = formData.endDate
        ? dayjs(formData.endDate).format("YYYY-MM-DD")
        : undefined;

      const updateData: UpdateClassDto = {
        name: formData.name,
        description: formData.description,
        startDate,
        endDate,
        quantity: formData.quantity,
        status: formData.status,
        teacherId: formData.teacherId || undefined,
        roomId: formData.roomId || undefined,
      };

      await updateClass({ id: classId, data: updateData }).unwrap();
      toast.success("Class updated successfully");
      refetch();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) return <Loading />;

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">
            Edit Class
          </Typography.Title>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Class Code:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput
              control={control}
              name="code"
              size="large"
              disabled
              defaultValue={classDetail?.code}
            />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Class Name:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput name="name" control={control} size="large" required />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Course:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomSelect
              name="courseId"
              control={control}
              size="large"
              options={courseOptions}
              disabled
            />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Start Date:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomDatePicker name="startDate" control={control} size="large" />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>End Date:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomDatePicker name="endDate" control={control} size="large" />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Quantity:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInputNumber name="quantity" control={control} size="large" />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Status:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomSelect
              name="status"
              control={control}
              size="large"
              options={StatusOptions}
            />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Teacher ID:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput name="teacherId" control={control} size="large" />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Room ID:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput name="roomId" control={control} size="large" />
          </div>
        </div>

        <div className="flex items-start">
          <div className="w-1/4">
            <Typography.Text strong>Description:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomTextArea name="description" control={control} rows={4} />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <CustomButton title="Cancel" size="large" onClick={handleCancel} />
        <CustomButton
          type="primary"
          title="Save"
          size="large"
          loading={isUpdating}
          disabled={isUpdating}
          onClick={handleSubmit(onSubmit)}
        />
      </div>
    </Card>
  );
};

export default ClassSettings;
