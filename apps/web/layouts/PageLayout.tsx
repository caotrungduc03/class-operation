import { HomeFilled } from "@ant-design/icons";
import { Breadcrumb, Layout } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";

interface PageLayoutProps extends React.PropsWithChildren {
  breadcrumbs: ItemType[];
}

const PageLayout = ({ children, breadcrumbs }: PageLayoutProps) => {
  return (
    <Layout className="px-10 pb-8 pt-2">
      <Breadcrumb
        className="my-4"
        items={[
          {
            href: "#",
            title: <HomeFilled />,
          },
          ...breadcrumbs,
        ]}
      />
      {children}
    </Layout>
  );
};

export default PageLayout;
