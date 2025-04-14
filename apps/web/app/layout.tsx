import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import AuthPersistence from "@web/components/AuthPersistence";
import { Metadata } from "next";
import React from "react";
import { Toaster } from "react-hot-toast";
import StoreProvider from "./StoreProvider";
import "./global.css";

export const metadata: Metadata = {
  title: "Class Operation System",
  description: "Class Operation",
};

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <StoreProvider>
        <AntdRegistry>
          <AuthPersistence>{children}</AuthPersistence>
          <Toaster
            toastOptions={{
              duration: 2000,
            }}
          />
        </AntdRegistry>
      </StoreProvider>
    </body>
  </html>
);

export default RootLayout;
