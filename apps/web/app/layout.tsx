import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import { Metadata } from 'next';
import React from 'react';
import StoreProvider from './StoreProvider';
import './global.css';

export const metadata: Metadata = {
  title: 'Class Operation',
  description: 'Class Operation',
};

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <StoreProvider>
        <AntdRegistry>{children}</AntdRegistry>
      </StoreProvider>
    </body>
  </html>
);

export default RootLayout;
