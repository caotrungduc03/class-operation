import { Input } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { Control, Controller } from "react-hook-form";

interface CustomInputProps {
  control: Control<any>;
  name: string;
  size?: SizeType;
  prefix?: React.ReactNode;
  placeholder?: string;
  type?: string;
}

const CustomInput = ({
  control,
  name,
  size,
  prefix,
  placeholder,
  type,
}: CustomInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        return (
          <div>
            {type === "password" ? (
              <Input.Password
                {...field}
                size={size}
                prefix={prefix}
                placeholder={placeholder}
              />
            ) : (
              <Input
                {...field}
                size={size}
                prefix={prefix}
                placeholder={placeholder}
              />
            )}
            {error?.message && <p className="text-red-500">{error.message}</p>}
          </div>
        );
      }}
    />
  );
};

export default CustomInput;
