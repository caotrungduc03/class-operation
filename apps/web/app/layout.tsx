import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import RouteGuard from "@web/components/RouteGuard";
import { Metadata } from "next";
import React from "react";
import { ToastContainer } from "react-toastify";
import StoreProvider from "./StoreProvider";
import "./global.css";

export const metadata: Metadata = {
  title: "Class Operation",
  description: "Class Operation",
};

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <StoreProvider>
        <AntdRegistry>
          <RouteGuard>{children}</RouteGuard>
          <ToastContainer />
        </AntdRegistry>
      </StoreProvider>
    </body>
  </html>
);

export default RootLayout;
