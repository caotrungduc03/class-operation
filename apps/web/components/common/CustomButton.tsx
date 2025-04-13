import { Button } from "antd";
import { ButtonColorType, ButtonSize, ButtonType } from "antd/es/button";
import clsx from "clsx";
import { ReactNode } from "react";

interface CustomButtonProps {
  type?: ButtonType;
  title?: string;
  children?: ReactNode;
  className?: string;
  size?: ButtonSize;
  color?: ButtonColorType;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  onClick?: any;
  loading?: boolean;
  disabled?: boolean;
}

const CustomButton = ({
  type,
  title,
  children,
  className,
  size,
  color,
  icon,
  iconPosition = "start",
  onClick,
  loading,
  disabled,
}: CustomButtonProps) => {
  return (
    <Button
      type={type}
      className={clsx(className)}
      size={size}
      icon={icon}
      iconPosition={iconPosition}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      color={color}
    >
      {title}
      {children}
    </Button>
  );
};

export default CustomButton;
