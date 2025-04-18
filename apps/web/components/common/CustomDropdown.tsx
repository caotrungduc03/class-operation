import { MoreOutlined } from "@ant-design/icons";
import { Placement } from "@web/libs/common";
import { Dropdown } from "antd";
import React from "react";

interface CustomDropdownProps {
  children: React.ReactNode | React.ReactNode[];
  icon?: React.ReactNode;
  trigger?: ("click" | "hover" | "contextMenu")[];
  placement?: Placement;
}

const CustomDropdown = ({
  children,
  icon = <MoreOutlined />,
  trigger = ["click"],
  placement = "bottomLeft",
}: CustomDropdownProps) => {
  const flattenedChildren = React.Children.toArray(children); // Flatten children
  const items = flattenedChildren.map((child, index) => ({
    key: index,
    label: child,
  }));

  return (
    <Dropdown
      menu={{ items }}
      trigger={trigger}
      placement={placement}
      overlayClassName="min-w-[150px]"
    >
      <div className="cursor-pointer">{icon}</div>
    </Dropdown>
  );
};

export default CustomDropdown;
