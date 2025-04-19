"use client";
import PageLayout from "@web/layouts/PageLayout";
import { NAV_LINK, NAV_TITLE } from "@web/libs/nav";
import { Card, Table } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";

const breadcrumbs: ItemType[] = [
  {
    href: NAV_LINK.MANAGE_REQUESTS,
    title: NAV_TITLE.MANAGE_REQUESTS,
  },
  {
    title: NAV_TITLE.WEEKLY_NORM_LIST,
  },
];

const WeeklyNormList = () => {
  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.WEEKLY_NORM_LIST}>
      <Card>
        <h1>Weekly Norm Requests</h1>
        <Table columns={[]} dataSource={[]} pagination={{ pageSize: 10 }} />
      </Card>
    </PageLayout>
  );
};

export default WeeklyNormList;
