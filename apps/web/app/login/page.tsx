"use client";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomInput from "@web/components/common/CustomInput";
import { useLoginMutation } from "@web/libs/features/auth/authApi";
import { Card, Typography } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

interface FormValues {
  email?: string;
  password?: string;
}

const Login = () => {
  const validationSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
  });

  const [login, { data, isLoading, isSuccess, isError, error }] =
    useLoginMutation();

  const router = useRouter();

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message);

      router.push("/");
    }
    if (isError) {
      toast.error(data?.message);
    }
  }, [isSuccess, data, isError, error, router]);

  const onSubmit = ({ email, password }: FormValues) => {
    login({ email, password });
  };

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4 pb-20">
        <Image src="/logo.png" alt="Logo" width={400} height={100} priority />
        <Card>
          <div className="flex w-[500px] flex-col gap-6">
            <div className="text-center">
              <Typography.Title level={2} className="mb-2">
                Login
              </Typography.Title>
              <Typography.Paragraph>
                Login to Continue Learning
              </Typography.Paragraph>
            </div>
            <CustomInput
              control={control}
              name="email"
              size="large"
              prefix={<UserOutlined className="mr-2" />}
              placeholder="Please enter your email"
            />
            <CustomInput
              control={control}
              name="password"
              size="large"
              prefix={<LockOutlined className="mr-2" />}
              placeholder="Please enter your password"
              type="password"
            />
            <CustomButton
              type="primary"
              title="Login"
              size="large"
              onClick={handleSubmit(onSubmit)}
              loading={isLoading}
            />
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Login;
