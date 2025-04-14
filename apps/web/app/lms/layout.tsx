import RouteGuard from "@web/components/RouteGuard";
import MainLayout from "@web/layouts/MainLayout";

const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <RouteGuard requiredAccess="LMS">
      <MainLayout>{children}</MainLayout>
    </RouteGuard>
  );
};

export default Layout;
