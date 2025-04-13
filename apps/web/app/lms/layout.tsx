import MainLayout from "@web/layouts/MainLayout";

const Layout = ({ children }: React.PropsWithChildren) => {
  return <MainLayout>{children}</MainLayout>;
};

export default Layout;
