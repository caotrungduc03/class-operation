"use client";
import PageLayout from "@web/layouts/PageLayout";
import { NAV_TITLE } from "@web/libs/nav";
import { Card, Table } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.TIME_OFF_REGISTRATION,
  },
];

const TimeOffRegistration = () => {
  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.TIME_OFF_LIST}>
      <Card>
        <h1>Time Off Registration</h1>
        <Table columns={[]} dataSource={[]} pagination={{ pageSize: 10 }} />
      </Card>
    </PageLayout>
  );
};

export default TimeOffRegistration;
