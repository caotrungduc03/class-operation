"use client";
import { ExclamationCircleFilled } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";
import { Drawer, Modal, Space, Typography } from "antd";
import CustomButton from "./CustomButton";

interface CustomDrawerProps {
  title: string;
  open: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
  children?: React.ReactNode;
  loading?: boolean;
}

const CustomDrawer = ({
  open,
  onCancel,
  title,
  onSubmit,
  children,
  loading,
}: CustomDrawerProps) => {
  const showCloseConfirm = () => {
    Modal.confirm({
      title: "Are you sure cancel this task?",
      icon: <ExclamationCircleFilled />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        onCancel?.();
      },
    });
  };

  return (
    <Drawer
      title={
        <Typography.Title level={4} className="mb-0">
          {title}
        </Typography.Title>
      }
      open={open}
      onClose={showCloseConfirm}
      size="large"
      extra={
        <Space>
          <CustomButton
            title="Cancel"
            onClick={showCloseConfirm}
            size="large"
          />
          <CustomButton
            title="Submit"
            type="primary"
            onClick={onSubmit}
            loading={loading}
            disabled={loading}
            size="large"
          />
        </Space>
      }
    >
      {children}
    </Drawer>
  );
};

export default CustomDrawer;
