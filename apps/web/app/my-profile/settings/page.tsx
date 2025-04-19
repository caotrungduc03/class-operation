"use client";

import CustomButton from "@web/components/common/CustomButton";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import { useUpdateProfileMutation } from "@web/libs/features/auth/authApi";
import { RoleOptions } from "@web/libs/role";
import { RootState } from "@web/libs/store";
import { StatusOptions, UserStatus } from "@web/libs/user";
import { Card, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const MyProfileSettings = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const router = useRouter();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      code: user?.detail?.code ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });
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
