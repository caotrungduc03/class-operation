"use client";
import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { NAV_LINK, NAV_TITLE } from "@web/constants/nav";
import PageLayout from "@web/layouts/PageLayout";
import { RootState } from "@web/libs/store";
import { Avatar, Card, Tabs, Tag, Typography } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.MY_PROFILE,
  },
];

const MyProfile = ({ children }: React.PropsWithChildren) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const totalFields = Object.keys(user).length;
  const countEmptyFields = useMemo(() => {
    return Object.values(user).filter((value) => !value).length;
  }, [user]);
  const percentage = useMemo(() => {
    if (totalFields === 0) return 0;
    return Math.round(((totalFields - countEmptyFields) / totalFields) * 100);
  }, [countEmptyFields, totalFields]);

  const tabs = [
    {
      key: "1",
      label: (
        <div onClick={() => router.push(NAV_LINK.MY_PROFILE_OVERVIEW)}>
          Overview
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div onClick={() => router.push(NAV_LINK.MY_PROFILE_SETTINGS)}>
          Settings
        </div>
      ),
    },
  ];

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MY_PROFILE}>
      <div className="my-profile flex flex-col gap-6">
        <Card>
          <div className="flex gap-6">
            <Avatar
              shape="square"
              size={160}
              icon={
                user?.avatar ? (
                  <Image
                    src={user?.avatar}
                    alt="Avatar"
                    width={160}
                    height={160}
                  />
                ) : (
                  <UserOutlined />
                )
              }
            />
            <div className="flex flex-col">
              <Typography.Title level={4}>{user?.fullName}</Typography.Title>
              <div className="flex gap-6">
                <div>
                  <Tag color={user?.status ? "green" : "red"}>
                    {user?.status ? "Active" : "Blocked"}
                  </Tag>
                </div>
                <div>
                  <MailOutlined />
                  <Typography.Text className="ml-2">
                    {user?.email}
                  </Typography.Text>
                </div>
                <div>
                  <PhoneOutlined />
                  <Typography.Text className="ml-2">
                    {user?.phoneNumber ?? "Unknown"}
                  </Typography.Text>
                </div>
              </div>
              <div className="mb-2 mt-auto">
                <div className="mb-2 flex justify-between">
                  <Typography.Text>Complete</Typography.Text>
                  <Typography.Text>{percentage}%</Typography.Text>
                </div>
                <div className="h-1 w-full rounded bg-gray-200">
                  <div
                    className="h-1 rounded bg-blue-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <Tabs items={tabs} className="mt-4" defaultActiveKey="1" />
        </Card>
        <Card>{children}</Card>
      </div>
    </PageLayout>
  );
};

export default MyProfile;
