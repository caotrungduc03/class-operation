import { Select } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { BaseOptionType } from "antd/es/select";
import { Control, Controller } from "react-hook-form";

interface CustomSelectProps {
  control: Control<any>;
  name: string;
  size?: SizeType;
  prefix?: React.ReactNode;
  placeholder?: string;
  options: BaseOptionType[];
  disabled?: boolean;
  defaultValue?: string;
}

const CustomSelect = ({
  control,
  name,
  size,
  prefix,
  placeholder,
  options,
  disabled,
  defaultValue,
}: CustomSelectProps) => {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className="w-full">
            <Select
              {...field}
              size={size}
              prefix={prefix}
              placeholder={placeholder}
              options={options}
              onChange={(value) => {
                field.onChange(value);
              }}
              className="w-full"
              disabled={disabled}
            />
            {error?.message && <p className="text-red-500">{error.message}</p>}
          </div>
        );
      }}
    />
  );
};

export default CustomSelect;
