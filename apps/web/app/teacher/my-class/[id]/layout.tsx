"use client";
import { CalendarOutlined, ReadOutlined } from "@ant-design/icons";
import Loading from "@web/components/common/Loading";
import PageLayout from "@web/layouts/PageLayout";
import { useGetClassByIdQuery } from "@web/libs/features/classes/classApi";
import { NAV_LINK, NAV_TITLE } from "@web/libs/nav";
import { STATUS_LABEL, STATUS_TAG } from "@web/libs/user";
import { Card, Tabs, Tag, Typography } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import React from "react";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.MY_TEACHER_CLASS,
    href: NAV_LINK.MY_TEACHER_CLASS,
  },
  {
    title: NAV_TITLE.CLASS_DETAIL,
  },
];

const ClassDetail = ({ children }: React.PropsWithChildren) => {
  const { id: classId } = useParams<{ id: string }>();

  const { data: classData, isLoading } = useGetClassByIdQuery(classId, {
    skip: !classId,
  });

  const classDetail = classData?.data;

  const tabs = [
    {
      key: "1",
      label: "Overview",
    },
  ];

  if (isLoading || !classDetail) return <Loading />;

  return (
    <PageLayout
      breadcrumbs={breadcrumbs}
      title={classDetail?.name || "Class Detail"}
    >
      <div className="class-detail flex flex-col gap-6">
        <Card>
          <div className="flex gap-6">
            <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-blue-100">
              <ReadOutlined style={{ fontSize: 64, color: "#1890ff" }} />
            </div>
            <div className="flex flex-grow flex-col">
              <div className="flex items-center justify-start">
                <Typography.Title level={4}>
                  {classDetail?.name}
                </Typography.Title>
              </div>
              <div className="flex gap-6">
                <div>
                  <Tag color={STATUS_TAG[classDetail.status]}>
                    {STATUS_LABEL[classDetail.status]}
                  </Tag>
                </div>
                <div>
                  <Typography.Text strong>Code: </Typography.Text>
                  <Typography.Text>{classDetail?.code}</Typography.Text>
                </div>
                <div>
                  <Typography.Text strong>Course: </Typography.Text>
                  <Typography.Text>{classDetail?.course?.name}</Typography.Text>
                </div>
              </div>
              <div className="mt-2 flex gap-6">
                <div>
                  <CalendarOutlined />
                  <Typography.Text className="ml-2">
                    {classDetail?.startDate
                      ? `${dayjs(classDetail?.startDate).format("DD/MM/YYYY")}`
                      : "Unknown"}
                    {classDetail?.endDate
                      ? ` - ${dayjs(classDetail?.endDate).format("DD/MM/YYYY")}`
                      : "Unknown"}
                  </Typography.Text>
                </div>
                <div>
                  <Typography.Text strong>Room: </Typography.Text>
                  <Typography.Text>
                    {classDetail?.room?.name || ""}
                  </Typography.Text>
                </div>
                <div>
                  <Typography.Text strong>Quantity: </Typography.Text>
                  <Typography.Text>
                    {classDetail?.quantity || 0}
                  </Typography.Text>
                </div>
              </div>
              <div className="mt-2">
                <Typography.Text strong>Description: </Typography.Text>
                <Typography.Paragraph ellipsis={{ rows: 2 }}>
                  {classDetail?.description}
                </Typography.Paragraph>
              </div>
            </div>
          </div>
          <Tabs size="large" items={tabs} className="mt-4" activeKey="1" />
        </Card>
        {children}
      </div>
    </PageLayout>
  );
};

export default ClassDetail;
