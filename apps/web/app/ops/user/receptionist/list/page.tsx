import PageLayout from "@web/layouts/PageLayout";
import { NAV_TITLE } from "@web/libs/nav";
import { Card } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";

const breadcrumbs: ItemType[] = [
  {
    href: "#",
    title: NAV_TITLE.USER_LIST,
  },
  {
    title: NAV_TITLE.RECEPTIONIST_LIST,
  },
];

const Receptionists = () => {
  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.RECEPTIONIST_LIST}>
      <Card>
        <h1>Receptionists</h1>
      </Card>
    </PageLayout>
  );
};

export default Receptionists;
