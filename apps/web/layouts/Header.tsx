"use client";
import {
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { logout } from "@web/libs/features/auth/authSlice";
import { toggleSidebar } from "@web/libs/features/layout/layoutSlice";
import { NAV_LINK } from "@web/libs/nav";
import { RootState } from "@web/libs/store";
import { Avatar, Badge, Button, Dropdown, Layout, MenuProps } from "antd";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { useDispatch, useSelector } from "react-redux";

const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarCollapsed } = useSelector((state: RootState) => state.layout);
  const dispatch = useDispatch();

  const items: MenuProps["items"] = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: <Link href={NAV_LINK.MY_PROFILE}>Thông tin cá nhân</Link>,
    },
    {
      key: "2",
      icon: <LogoutOutlined />,
      label: (
        <Link href={NAV_LINK.LOGIN} onClick={() => dispatch(logout())}>
          Đăng xuất
        </Link>
      ),
      danger: true,
    },
  ];

  return (
    <Layout.Header className="flex items-center justify-between border-b border-solid border-gray-200 bg-white px-0 py-2 shadow">
      <Button
        type="text"
        icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => dispatch(toggleSidebar())}
        className="h-12 w-12"
      />
      <div className="flex items-center gap-4 pr-4">
        <Badge count={1}>
          <BellOutlined className="text-xl" />
        </Badge>
        <Dropdown menu={{ items }} placement="bottomLeft">
          <a
            className="flex h-10 items-center justify-end gap-2 px-2"
            onClick={(e) => e.preventDefault()}
          >
            <span className="font-bold">{user?.fullName}</span>
            <Avatar
              icon={
                user?.avatar ? (
                  <Image
                    src={user?.avatar}
                    alt="Avatar"
                    width={160}
                    height={160}
                  />
                ) : (
                  <UserOutlined />
                )
              }
            />
          </a>
        </Dropdown>
      </div>
    </Layout.Header>
  );
};

export default memo(Header);
