"use client";
import { NAV_TITLE } from "@web/constants/nav";
import PageLayout from "@web/layouts/PageLayout";
import { RootState } from "@web/libs/store";
import { Card, Typography } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useSelector } from "react-redux";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.HOME,
  },
];

const HomeOPS = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.HOME}>
      <Card>
        <Typography.Title level={2} className="mb-0">
          {`Chào mừng ${user?.fullName}, quay trở lại hệ thống!`}
        </Typography.Title>
      </Card>
    </PageLayout>
  );
};

export default HomeOPS;
