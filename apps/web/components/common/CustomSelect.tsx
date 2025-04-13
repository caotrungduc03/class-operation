import { Select } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { BaseOptionType } from "antd/es/select";
import { Control, Controller } from "react-hook-form";
import CustomLabel from "./CustomLabel";

interface CustomSelectProps {
  control: Control<any>;
  name: string;
  size?: SizeType;
  prefix?: React.ReactNode;
  placeholder?: string;
  options: BaseOptionType[];
  disabled?: boolean;
  defaultValue?: string;
  label?: string;
  required?: boolean;
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
  label,
  required,
}: CustomSelectProps) => {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className="w-full">
            {label && <CustomLabel label={label} required={required} />}

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
