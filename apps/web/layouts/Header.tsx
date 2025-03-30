import {
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { toggleSidebar } from "@web/libs/features/layout/layoutSlice";
import { RootState } from "@web/libs/store";
import { Avatar, Badge, Button, Layout } from "antd";
import { useDispatch, useSelector } from "react-redux";

const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarCollapsed } = useSelector((state: RootState) => state.layout);
  const dispatch = useDispatch();

  return (
    <Layout.Header className="flex items-center justify-between border-b border-solid border-gray-200 bg-white px-0 py-2 shadow">
      <Button
        type="text"
        icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => dispatch(toggleSidebar())}
        className="h-12 w-12"
      />
      <div className="flex items-center gap-4">
        <Badge count={1}>
          <BellOutlined className="text-xl" />
        </Badge>
        <div className="flex min-w-40 items-center justify-end gap-2 px-2">
          <span>{user?.fullName}</span>
          <Avatar icon={<UserOutlined />} />
        </div>
      </div>
    </Layout.Header>
  );
};

export default Header;
