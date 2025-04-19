"use client";
import CustomButton from "@web/components/common/CustomButton";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import FilterGrid from "@web/components/common/FilterGrid";
import PageLayout from "@web/layouts/PageLayout";
import { useGetWeeklyNormsQuery } from "@web/libs/features/weekly-norms/weeklyNormApi";
import { NAV_TITLE } from "@web/libs/nav";
import { Card } from "antd";
import AntdCalendar from "antd-calendar";
import { IEvent } from "antd-calendar/dist/types";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.MY_CALENDAR,
  },
];

// Example event types - replace with your actual options
const EVENT_TYPES = [
  { value: "meeting", label: "Meeting" },
  { value: "class", label: "Class" },
  { value: "appointment", label: "Appointment" },
];

const MyCalendar = () => {
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf("month").toISOString(),
    endDate: dayjs().endOf("month").toISOString(),
  });
  const [searchParams, setSearchParams] = useState({
    eventName: "",
    eventType: "",
  });

  const { data: weeklyNorms, isFetching } = useGetWeeklyNormsQuery(dateRange);

  const searchForm = useForm();

  const handleOpenDetail = useCallback((date: Date, events: IEvent[]) => {
    // Handle opening event details
    console.log("Open event details", date, events);
  }, []);

  const handleOpenCreate = useCallback((date: Date) => {
    // Handle creating new event
    console.log("Create new event on", date);
  }, []);

  const handleRefetchAPI = useCallback(
    async (startDate: Date, endDate: Date) => {
      // Chỉ cập nhật dateRange khi dữ liệu thực sự thay đổi
      const newStartDate = dayjs(startDate).toISOString();
      const newEndDate = dayjs(endDate).toISOString();

      if (
        newStartDate !== dateRange.startDate ||
        newEndDate !== dateRange.endDate
      ) {
        setDateRange({
          startDate: newStartDate,
          endDate: newEndDate,
        });
      }

      return Promise.resolve();
    },
    [dateRange],
  );

  const onSubmitSearch = (data: { eventName?: string; eventType?: string }) => {
    setSearchParams({
      eventName: data.eventName || "",
      eventType: data.eventType || "",
    });
  };

  const handleReset = () => {
    searchForm.reset();
    setSearchParams({
      eventName: "",
      eventType: "",
    });
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MY_CALENDAR}>
      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-4">
            <FilterGrid>
              <CustomInput
                control={searchForm.control}
                name="eventName"
                size="large"
                placeholder="Search by event name"
              />
              <CustomSelect
                control={searchForm.control}
                name="eventType"
                size="large"
                placeholder="Filter by event type"
                options={EVENT_TYPES}
              />
            </FilterGrid>
            <div className="flex justify-between">
              <div className="flex gap-4">
                <CustomButton
                  title="Reset"
                  size="large"
                  onClick={handleReset}
                />
                <CustomButton
                  type="primary"
                  title="Search"
                  size="large"
                  onClick={searchForm.handleSubmit(onSubmitSearch)}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <AntdCalendar
            events={[]}
            norms={
              weeklyNorms?.data?.map((norm) => ({
                id: norm.id,
                startDate: dayjs(norm.startDate).toDate(),
                endDate: dayjs(norm.endDate).toDate(),
                maxShift: norm.quantity,
              })) || []
            }
            onOpenDetail={handleOpenDetail}
            onOpenCreate={handleOpenCreate}
            onRefetchAPI={handleRefetchAPI}
            loading={isFetching}
            showWeeklyNorm
          />
        </Card>
      </div>
    </PageLayout>
  );
};

export default MyCalendar;
