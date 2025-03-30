import { NAV_TITLE } from "@web/constants/nav";
import PageLayout from "@web/layouts/PageLayout";
import { Card } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";

const breadcrumbs: ItemType[] = [
  {
    href: "#",
    title: NAV_TITLE.USERS,
  },
  {
    title: NAV_TITLE.TEACHERS,
  },
];

const Teachers = () => {
  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <Card>
        <h1>Teachers</h1>
      </Card>
    </PageLayout>
  );
};

export default Teachers;
