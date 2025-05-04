"use client";
import PageLayout from "@web/layouts/PageLayout";
import { NAV_TITLE } from "@web/libs/nav";
import { Card } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.MY_CLASS,
  },
];

const MyClass = () => {
  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MY_CLASS}>
      <Card>
        <h1>My Class</h1>
      </Card>
    </PageLayout>
  );
};

export default MyClass;
