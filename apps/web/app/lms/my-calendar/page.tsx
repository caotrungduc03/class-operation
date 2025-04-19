"use client";
import PageLayout from "@web/layouts/PageLayout";
import { NAV_TITLE } from "@web/libs/nav";
import { Calendar, Card } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.MY_CALENDAR,
  },
];

const MyCalendar = () => {
  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MY_CALENDAR}>
      <Card>
        <Calendar />
      </Card>
    </PageLayout>
  );
};

export default MyCalendar;
