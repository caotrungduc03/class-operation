import "@ant-design/v5-patch-for-react-19";
import RouteGuard from "@web/components/RouteGuard";
import MainLayout from "@web/layouts/MainLayout";

const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <RouteGuard requiredAccess="OPS">
      <MainLayout>{children}</MainLayout>
    </RouteGuard>
  );
};

export default Layout;
