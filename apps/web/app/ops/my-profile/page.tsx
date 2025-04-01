import { NAV_TITLE } from "@web/constants/nav";
import PageLayout from "@web/layouts/PageLayout";
import { Card } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.MY_PROFILE,
  },
];

const MyProfile = () => {
  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MY_PROFILE}>
      <Card>
        <h1>MyProfile</h1>
      </Card>
    </PageLayout>
  );
};

export default MyProfile;
