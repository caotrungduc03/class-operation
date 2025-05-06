"use client";
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
import { StatusOptions } from "@web/libs/user";
import { Card, Typography } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const UserSettings = () => {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { data, isLoading, refetch } = useGetUserByIdQuery(userId);
  const user = data?.data;
  const router = useRouter();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      roleName: "",
      status: "",
      departmentId: "",
      fieldId: "",
    },
  });

  // Watch the role to determine which fields to show
  const roleWatch = watch("roleName");

  // Check if user is a teacher (for showing field)
  const isTeacher =
    roleWatch?.includes("TEACHER_PART_TIME") ||
    roleWatch?.includes("TEACHER_FULL_TIME");

  // Check if user is a student (for hiding department)
  const isStudent = roleWatch === "STUDENT";

  // Use debounced select hooks for departments and fields
  const { selectProps: departmentSelectProps } = useDebouncedSelect({
    control,
    name: "departmentId",
    useGetDataQuery: useGetDepartmentsQuery,
    labelField: "name",
  });

  const { selectProps: fieldSelectProps } = useDebouncedSelect({
    control,
    name: "fieldId",
    useGetDataQuery: useGetFieldsQuery,
    labelField: "name",
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
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        roleName: user.role?.roleName || "",
        status: user.status || "",
        departmentId: user.detail?.department?.id || "",
        fieldId: user.detail?.field?.id || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: any) => {
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
            <Typography.Text>{user?.detail?.code || ""}</Typography.Text>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>First name:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput name="firstName" control={control} size="large" />
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Last name:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput name="lastName" control={control} size="large" />
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-1/4">
            <Typography.Text strong>Email:</Typography.Text>
          </div>
          <div className="w-3/4">
            <CustomInput name="email" control={control} size="large" disabled />
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

export default UserSettings;
