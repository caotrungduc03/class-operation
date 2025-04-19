"use client";
import PageLayout from "@web/layouts/PageLayout";
import { NAV_TITLE } from "@web/libs/nav";
import { Card } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.MANAGE_CALENDAR,
  },
];

const Calendar = () => {
  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MANAGE_CALENDAR}>
      <Card>
        <h1>Calendar Management</h1>
      </Card>
    </PageLayout>
  );
};

export default Calendar;
