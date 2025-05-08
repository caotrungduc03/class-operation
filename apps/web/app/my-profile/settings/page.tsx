"use client";

import CustomButton from "@web/components/common/CustomButton";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import { useUpdateProfileMutation } from "@web/libs/features/auth/authApi";
import { RoleName, RoleOptions } from "@web/libs/role";
import { RootState } from "@web/libs/store";
import { StatusOptions, TeacherLevelOptions, UserStatus } from "@web/libs/user";
import { Card, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const MyProfileSettings = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const router = useRouter();

  // Check if user is a teacher
  const isTeacher = [
    RoleName.TEACHER_FULL_TIME,
    RoleName.TEACHER_PART_TIME,
  ].includes(user?.role?.roleName);

  // Check if user is a student
  const isStudent = user?.role?.roleName === RoleName.STUDENT;

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      code: user?.detail?.code ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      departmentId: user?.detail?.department?.id ?? "",
      fieldId: user?.detail?.field?.id ?? "",
      teacherLevel: user?.detail?.teacherLevel ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        code: user?.detail?.code ?? "",
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        email: user?.email ?? "",
        phoneNumber: user?.phoneNumber ?? "",
        departmentId: user?.detail?.department?.id ?? "",
        fieldId: user?.detail?.field?.id ?? "",
        teacherLevel: user?.detail?.teacherLevel ?? "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: any) => {
    try {
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        departmentId: !isStudent ? data.departmentId : undefined,
        fieldId: isTeacher ? data.fieldId : undefined,
        teacherLevel: isTeacher ? data.teacherLevel : undefined,
      };

      const res = await updateProfile(updateData);
      if (res.data.statusCode === 200) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleCancel = () => {
    reset({
      code: user?.detail?.code ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      departmentId: user?.detail?.department?.id ?? "",
      fieldId: user?.detail?.field?.id ?? "",
      teacherLevel: user?.detail?.teacherLevel ?? "",
    });
    router.push("/my-profile");
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">
            Profile Settings
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
              name="role"
              control={control}
              size="large"
              options={RoleOptions}
              defaultValue={user?.role?.roleName}
              disabled
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
                size="large"
                options={[
                  {
                    label: user?.detail?.department?.name,
                    value: user?.detail?.department?.id,
                  },
                ]}
                disabled
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
                size="large"
                options={[
                  {
                    label: user?.detail?.field?.name,
                    value: user?.detail?.field?.id,
                  },
                ]}
                disabled
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
                disabled
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
              defaultValue={
                user?.status ? UserStatus.ACTIVE : UserStatus.BLOCKED
              }
              disabled
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
          loading={isLoading}
          disabled={isLoading}
          onClick={handleSubmit(onSubmit)}
        />
      </div>
    </Card>
  );
};

export default MyProfileSettings;
