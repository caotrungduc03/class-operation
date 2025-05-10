"use client";
import CustomButton from "@web/components/common/CustomButton";
import Loading from "@web/components/common/Loading";
import { useGetClassByIdQuery } from "@web/libs/features/classes/classApi";
import { NAV_LINK } from "@web/libs/nav";
import { STATUS_LABEL, STATUS_TAG } from "@web/libs/user";
import { Card, Descriptions, Tag, Typography } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams } from "next/navigation";

const ClassOverview = () => {
  const { id } = useParams<{ id: string }>();

  const { data: classData, isLoading } = useGetClassByIdQuery(id, {
    skip: !id,
  });

  const classDetail = classData?.data;

  if (isLoading) return <Loading />;

  if (!classDetail) return <Typography.Text>Class not found</Typography.Text>;

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">
            Class Overview
          </Typography.Title>
          <Link href={NAV_LINK.CLASS_DETAIL_SETTINGS(id)}>
            <CustomButton type="primary" title="Edit Class" size="large" />
          </Link>
        </div>
      }
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Class Code" span={1}>
          {classDetail.code}
        </Descriptions.Item>
        <Descriptions.Item label="Status" span={1}>
          <Tag color={STATUS_TAG[classDetail.status]}>
            {STATUS_LABEL[classDetail.status]}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Class Name" span={2}>
          {classDetail.name}
        </Descriptions.Item>
        <Descriptions.Item label="Course" span={2}>
          {classDetail.course?.name} ({classDetail.course?.code})
        </Descriptions.Item>
        <Descriptions.Item label="Teacher" span={1}>
          {classDetail.teacher?.fullName || ""}
        </Descriptions.Item>
        <Descriptions.Item label="Room" span={1}>
          {classDetail.room?.name || ""}
        </Descriptions.Item>
        <Descriptions.Item label="Start Date" span={1}>
          {classDetail.startDate
            ? dayjs(classDetail.startDate).format("DD/MM/YYYY")
            : "Not set"}
        </Descriptions.Item>
        <Descriptions.Item label="End Date" span={1}>
          {classDetail.endDate
            ? dayjs(classDetail.endDate).format("DD/MM/YYYY")
            : "Not set"}
        </Descriptions.Item>
        <Descriptions.Item label="Quantity" span={2}>
          {classDetail.quantity || 0} students
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          {classDetail.description || ""}
        </Descriptions.Item>
        <Descriptions.Item label="Created At" span={1}>
          {dayjs(classDetail.createdAt).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At" span={1}>
          {dayjs(classDetail.updatedAt).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ClassOverview;
