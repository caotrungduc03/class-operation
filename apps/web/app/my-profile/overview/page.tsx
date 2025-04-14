"use client";
import CustomButton from "@web/components/common/CustomButton";
import { NAV_LINK } from "@web/constants/nav";
import { RoleTag } from "@web/constants/role";
import { RootState } from "@web/libs/store";
import { Card, Tag, Typography } from "antd";
import Link from "next/link";
import { useSelector } from "react-redux";

const MyProfileOverview = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">
            Profile Overview
          </Typography.Title>
          <Link href={NAV_LINK.MY_PROFILE_SETTINGS}>
            <CustomButton type="primary" title="Update Profile" size="large" />
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex">
          <div className="w-1/4">
            <Typography.Text strong>Code:</Typography.Text>
          </div>
          <div className="w-3/4">
            <Typography.Text>{user?.detail?.code || ""}</Typography.Text>
          </div>
        </div>
        <div className="flex">
          <div className="w-1/4">
            <Typography.Text strong>Full name:</Typography.Text>
          </div>
          <div className="w-3/4">
            <Typography.Text>{user?.fullName || ""}</Typography.Text>
          </div>
        </div>
        <div className="flex">
          <div className="w-1/4">
            <Typography.Text strong>Email:</Typography.Text>
          </div>
          <div className="w-3/4">
            <Typography.Text>{user?.email || ""}</Typography.Text>
          </div>
        </div>
        <div className="flex">
          <div className="w-1/4">
            <Typography.Text strong>Phone number:</Typography.Text>
          </div>
          <div className="w-3/4">
            <Typography.Text>{user?.phoneNumber || ""}</Typography.Text>
          </div>
        </div>
        <div className="flex">
          <div className="w-1/4">
            <Typography.Text strong>Role:</Typography.Text>
          </div>
          <div className="w-3/4">
            <div>
              <Tag color={RoleTag[user?.role?.roleName]}>
                {user?.role?.roleName}
              </Tag>
            </div>
          </div>
        </div>
        <div className="mb-4 flex">
          <div className="w-1/4">
            <Typography.Text strong>Status:</Typography.Text>
          </div>
          <div className="w-3/4">
            <div>
              <Tag color={user?.status ? "green" : "red"}>
                {user?.status ? "Active" : "Blocked"}
              </Tag>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MyProfileOverview;
