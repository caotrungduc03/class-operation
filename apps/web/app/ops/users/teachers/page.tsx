"use client";
import { PlusOutlined } from "@ant-design/icons";
import CustomButton from "@web/components/common/CustomButton";
import CustomInput from "@web/components/common/CustomInput";
import FilterGrid from "@web/components/common/FilterGrid";
import { NAV_TITLE } from "@web/constants/nav";
import PageLayout from "@web/layouts/PageLayout";
import { Card } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useForm } from "react-hook-form";

const breadcrumbs: ItemType[] = [
  {
    href: "#",
    title: NAV_TITLE.USERS,
  },
  {
    title: NAV_TITLE.TEACHERS,
  },
];

const Teachers = () => {
  const { control } = useForm();

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.TEACHERS}>
      <Card>
        <div className="flex flex-col gap-6">
          <FilterGrid>
            <CustomInput
              control={control}
              name="search"
              size="large"
              placeholder="Please enter teacher name"
            />
          </FilterGrid>
          <div className="flex justify-between">
            <div className="flex gap-4">
              <CustomButton title="Reset" size="large" />
              <CustomButton type="primary" title="Search" size="large" />
            </div>
            <CustomButton
              type="primary"
              title="Add Teacher"
              size="large"
              icon={<PlusOutlined />}
            />
          </div>
        </div>
      </Card>
    </PageLayout>
  );
};

export default Teachers;
