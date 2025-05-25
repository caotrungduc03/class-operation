"use client";
import { CloseOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import Loading from "@web/components/common/Loading";
import { useDebouncedSelect } from "@web/hooks/useDebouncedSelect";
import { useGetDepartmentsQuery } from "@web/libs/features/departments/departmentApi";
import { useGetFieldsQuery } from "@web/libs/features/fields/fieldApi";
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "@web/libs/features/users/userApi";
import { NAV_LINK } from "@web/libs/nav";
import {
  ManagerRoleOptions,
  RoleName,
  RoleOptions,
  StaffRoleOptions,
  TeacherRoleOptions,
} from "@web/libs/role";
import {
  StatusOptions,
  TeacherLevel,
  TeacherLevelOptions,
  UserStatus,
} from "@web/libs/user";
import { Card, Typography } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

// Define Zod schema for user settings validation
const userSettingsSchema = z.object({
  code: z.string().min(1, "Code is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  roleName: z.nativeEnum(RoleName, { required_error: "Role is required" }),
  status: z.nativeEnum(UserStatus, { required_error: "Status is required" }),
  departmentId: z.string().optional(),
  fieldId: z.string().optional(),
  teacherLevel: z.nativeEnum(TeacherLevel).optional(),
});

// Define type from schema
type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;

const UserSettings = () => {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { data, isLoading, refetch } = useGetUserByIdQuery(userId);
  const user = data?.data;
  const router = useRouter();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // Add default options for department and field
  const departmentOptions = user?.detail?.department
    ? [
        {
          label: user.detail.department.name,
          value: user.detail.department.id,
        },
      ]
    : [];

  const fieldOptions = user?.detail?.field
    ? [
        {
          label: user.detail.field.name,
          value: user.detail.field.id,
        },
      ]
    : [];

  const { control, handleSubmit, reset, watch } =
    useForm<UserSettingsFormValues>({
      resolver: zodResolver(userSettingsSchema),
    });

  // Watch the role to determine which fields to show
  const roleWatch = watch("roleName");

  // Check if user is a teacher (for showing field)
  const isTeacher =
    roleWatch?.includes(RoleName.TEACHER_FULL_TIME) ||
    roleWatch?.includes(RoleName.TEACHER_PART_TIME);

  // Check if user is a student (for hiding department)
  const isStudent = roleWatch === RoleName.STUDENT;

  // Use debounced select hooks for departments and fields
  const { selectProps: departmentSelectProps } = useDebouncedSelect({
    control,
    name: "departmentId",
    useGetDataQuery: useGetDepartmentsQuery,
    labelField: "name",
    valueField: "id",
    initialOptions: departmentOptions,
  });

  const { selectProps: fieldSelectProps } = useDebouncedSelect({
    control,
    name: "fieldId",
    useGetDataQuery: useGetFieldsQuery,
    labelField: "name",
    valueField: "id",
    initialOptions: fieldOptions,
  });

  // Get role options based on current role
  const getRoleOptions = () => {
    if (!user?.role?.roleName) return RoleOptions;

    if (
      [RoleName.TEACHER_FULL_TIME, RoleName.TEACHER_PART_TIME].includes(
        user.role.roleName,
      )
    ) {
      return TeacherRoleOptions;
    } else if (
      [
        RoleName.RECEPTIONIST,
        RoleName.STAFF_ACADEMIC,
        RoleName.STAFF_GENERAL,
      ].includes(user.role.roleName)
    ) {
      return StaffRoleOptions;
    } else if ([RoleName.ADMIN, RoleName.MANAGE].includes(user.role.roleName)) {
      return ManagerRoleOptions;
    }

    return RoleOptions;
  };

  // Set form values when user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        code: user.detail?.code || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        roleName: user.role?.roleName,
        status: user.status,
        departmentId: user.detail?.department?.id || "",
        fieldId: user.detail?.field?.id || "",
        teacherLevel: user.detail?.teacherLevel,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UserSettingsFormValues) => {
    try {
      await updateUser({
        id: userId,
        body: data,
      }).unwrap();

      toast.success("User updated successfully");
      refetch();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCancel = () => {
    router.push(NAV_LINK.USER_DETAIL_OVERVIEW(userId));
  };

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">
            User Settings
          </Typography.Title>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Code:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput name="code" control={control} size="large" disabled />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>First name:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput
              name="firstName"
              control={control}
              size="large"
              required
            />
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Last name:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput
              name="lastName"
              control={control}
              size="large"
              required
            />
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Email:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput
              name="email"
              control={control}
              size="large"
              disabled
              required
            />
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Phone number:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput name="phoneNumber" control={control} size="large" />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Role:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomSelect
              name="roleName"
              control={control}
              size="large"
              options={getRoleOptions()}
              required
            />
          </div>
        </div>

        {/* Department field - show for all roles except STUDENT */}
        {!isStudent && (
          <div className="flex items-center">
            <div className="w-1/4">
              <Typography.Text strong>Department:</Typography.Text>
            </div>
            <div className="w-3/4">
              <CustomSelect
                control={control}
                name="departmentId"
                placeholder="Select department"
                options={departmentSelectProps.options}
                onFocus={departmentSelectProps.onFocus}
                onPopupScroll={departmentSelectProps.onPopupScroll}
                size="large"
              />
            </div>
          </div>
        )}

        {/* Field field - show only for teachers */}
        {isTeacher && (
          <div className="flex items-center">
            <div className="w-1/4">
              <Typography.Text strong>Field:</Typography.Text>
            </div>
            <div className="w-3/4">
              <CustomSelect
                control={control}
                name="fieldId"
                placeholder="Select field"
                options={fieldSelectProps.options}
                onFocus={fieldSelectProps.onFocus}
                onPopupScroll={fieldSelectProps.onPopupScroll}
                size="large"
              />
            </div>
          </div>
        )}

        {/* Teacher Level - show only for teachers */}
        {isTeacher && (
          <div className="flex items-center">
            <div className="w-1/4">
              <Typography.Text strong>Teacher Level:</Typography.Text>
            </div>
            <div className="w-3/4">
              <CustomSelect
                name="teacherLevel"
                control={control}
                size="large"
                options={TeacherLevelOptions}
                placeholder="Select teacher level"
              />
            </div>
          </div>
        )}

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
              required
            />
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <CustomButton
          title="Cancel"
          size="large"
          icon={<CloseOutlined />}
          onClick={handleCancel}
        />
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

export default UserSettings;
