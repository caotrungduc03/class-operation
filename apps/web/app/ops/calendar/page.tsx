"use client";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDatePicker from "@web/components/common/CustomDatePicker";
import CustomDrawer from "@web/components/common/CustomDrawer";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTextArea from "@web/components/common/CustomTextArea";
import CustomTimePicker from "@web/components/common/CustomTimePicker";
import FilterGrid from "@web/components/common/FilterGrid";
import { useDebouncedSelect } from "@web/hooks/useDebouncedSelect";
import PageLayout from "@web/layouts/PageLayout";
import { useCreateBusyScheduleMutation } from "@web/libs/features/requests/requestApi";
import { useGetSchedulesQuery } from "@web/libs/features/schedules/scheduleApi";
import { useGetTeachersQuery } from "@web/libs/features/users/userApi";
import { useGetWeeklyNormsQuery } from "@web/libs/features/weekly-norms/weeklyNormApi";
import { NAV_TITLE } from "@web/libs/nav";
import {
  SCHEDULE_TYPE_LABEL,
  SCHEDULE_TYPE_OPTIONS,
  SCHEDULE_TYPE_TAG,
} from "@web/libs/schedule";
import { Card, Divider, Modal, Tag, Typography } from "antd";
import AntdCalendar from "antd-calendar";
import { EventType } from "antd-calendar/dist/constants";
import { IEvent } from "antd-calendar/dist/types";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.MANAGE_CALENDAR,
  },
];

// Define validation schemas
const searchFormSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  teacherId: z.string().optional(),
});

const busyScheduleFormSchema = z.object({
  name: z.string().min(1, "Request name is required"),
  description: z.string().optional(),
  reason: z.string().min(1, "Reason is required"),
  date: z.any().refine((val) => !!val, "Date is required"),
  startTime: z.any().refine((val) => !!val, "Start time is required"),
  endTime: z.any().refine((val) => !!val, "End time is required"),
});

// Define types based on the schemas
type SearchFormValues = z.infer<typeof searchFormSchema>;
type BusyScheduleFormValues = z.infer<typeof busyScheduleFormSchema>;

const Calendar = () => {
  const [isBusyScheduleModalOpen, setIsBusyScheduleModalOpen] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<IEvent[]>([]);

  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf("month").startOf("week").toISOString(),
    endDate: dayjs().endOf("month").endOf("week").toISOString(),
  });

  const [searchParams, setSearchParams] = useState<SearchFormValues>({
    name: undefined,
    type: undefined,
    teacherId: undefined,
  });

  // Update API queries to use teacherId from searchParams instead of selectedTeacher
  const {
    isLoading: isLoadingWeeklyNorms,
    data: weeklyNorms,
    isFetching: isFetchingWeeklyNorms,
    refetch: refetchWeeklyNorms,
  } = useGetWeeklyNormsQuery(
    {
      ...dateRange,
      teacherId: searchParams.teacherId,
    },
    {
      skip: !searchParams.teacherId,
    },
  );

  const {
    isLoading: isLoadingSchedules,
    data: schedules,
    isFetching: isFetchingSchedules,
    refetch: refetchSchedules,
  } = useGetSchedulesQuery(
    {
      ...searchParams,
      ...dateRange,
    },
    {
      skip: !searchParams.teacherId,
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (!isRefetching || isLoadingWeeklyNorms || isLoadingSchedules) return;

    refetchWeeklyNorms();
    refetchSchedules();
    setIsRefetching(false);
  }, [isRefetching, refetchSchedules, refetchWeeklyNorms]);

  const [createBusySchedule, { isLoading: isCreatingBusySchedule }] =
    useCreateBusyScheduleMutation();

  // Update forms with zod resolver
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
  });

  const {
    selectProps: { options, onFocus, onPopupScroll },
  } = useDebouncedSelect({
    control: searchForm.control,
    name: "teacherId",
    useGetDataQuery: useGetTeachersQuery,
    labelField: "fullName",
  });

  const busyScheduleForm = useForm<BusyScheduleFormValues>({
    resolver: zodResolver(busyScheduleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      reason: "",
      date: null,
      startTime: null,
      endTime: null,
    },
  });

  const events = useMemo(() => {
    if (!schedules?.data) return [];

    return schedules.data.map((schedule) => ({
      id: schedule.id,
      title: schedule.name,
      startDate: dayjs(schedule.startDate).toDate(),
      endDate: dayjs(schedule.endDate).toDate(),
      type: schedule.type as unknown as EventType,
      description: schedule.description,
    }));
  }, [schedules]);

  const norms = useMemo(() => {
    if (!weeklyNorms?.data) return [];

    return weeklyNorms.data.map((norm) => ({
      id: norm.id,
      startDate: dayjs(norm.startDate).toDate(),
      endDate: dayjs(norm.endDate).toDate(),
      maxShift: norm.quantity,
    }));
  }, [weeklyNorms]);

  const handleOpenDetail = useCallback((date: Date, events: IEvent[]) => {
    setSelectedDate(date);
    setSelectedEvents(events);
    setIsDetailModalOpen(true);
  }, []);

  const handleOpenCreate = useCallback(
    (date: Date) => {
      // Pre-fill the date field with the selected date
      busyScheduleForm.setValue("date", dayjs(date));
      // Open the busy schedule modal using local state
      setIsBusyScheduleModalOpen(true);
    },
    [busyScheduleForm],
  );

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

  const onSubmitSearch = (data: SearchFormValues) => {
    if (!data.teacherId) {
      return toast.error("Please select a teacher");
    }

    setSearchParams({
      ...searchParams,
      ...data,
    });
    setIsRefetching(true);
  };

  const handleReset = () => {
    searchForm.reset();
    setSearchParams({
      name: undefined,
      type: undefined,
      teacherId: undefined,
    });
    setIsRefetching(true);
  };

  const handleCloseBusyScheduleModal = () => {
    setIsBusyScheduleModalOpen(false);
    busyScheduleForm.reset();
  };

  const onSubmitBusySchedule = async (data: BusyScheduleFormValues) => {
    // Create a date object for the selected date
    const selectedDate = data.date.toDate();

    // Create start and end datetime by combining the date with selected times
    const startDateTime = data.startTime.toDate();
    const endDateTime = data.endTime.toDate();

    // Set the date component of startDateTime and endDateTime to match the selected date
    startDateTime.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );
    endDateTime.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    const formattedData = {
      name: data.name,
      description: data.description || "",
      reason: data.reason || "",
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      teacherId: searchParams.teacherId,
    };

    try {
      // Call the API to create busy schedule
      await createBusySchedule(formattedData).unwrap();
      toast.success("Busy schedule created successfully");
      handleCloseBusyScheduleModal();
    } catch (error) {
      toast.error(
        "Failed to create busy schedule: " +
          (error.data?.message || "Unknown error"),
      );
    }
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs} title={NAV_TITLE.MANAGE_CALENDAR}>
      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-4">
            <FilterGrid>
              <CustomInput
                control={searchForm.control}
                name="name"
                size="large"
                placeholder="Search by event name"
              />
              <CustomSelect
                control={searchForm.control}
                name="type"
                size="large"
                placeholder="Filter by event type"
                options={SCHEDULE_TYPE_OPTIONS}
              />
              <CustomSelect
                control={searchForm.control}
                name="teacherId"
                size="large"
                placeholder="Select Teacher"
                options={options}
                onFocus={onFocus}
                onPopupScroll={onPopupScroll}
              />
            </FilterGrid>
            <div className="flex justify-between">
              <div className="flex gap-4">
                <CustomButton
                  title="Reset"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                />
                <CustomButton
                  type="primary"
                  title="Search"
                  size="large"
                  icon={<SearchOutlined />}
                  onClick={searchForm.handleSubmit(onSubmitSearch)}
                />
              </div>
              <CustomButton
                type="primary"
                title="Create Busy Schedule"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsBusyScheduleModalOpen(true)}
              />
            </div>
          </div>
        </Card>

        {searchParams.teacherId ? (
          <Card>
            <AntdCalendar
              events={events}
              norms={norms}
              onOpenDetail={handleOpenDetail}
              onOpenCreate={handleOpenCreate}
              onRefetchAPI={handleRefetchAPI}
              loading={isFetchingWeeklyNorms || isFetchingSchedules}
              weeklyNormTitle="Định mức"
              monthTitles={[
                "Thứ Hai",
                "Thứ Ba",
                "Thứ Tư",
                "Thứ Năm",
                "Thứ Sáu",
                "Thứ Bảy",
                "Chủ Nhật",
              ]}
              weekTitles={[
                "Thứ Hai",
                "Thứ Ba",
                "Thứ Tư",
                "Thứ Năm",
                "Thứ Sáu",
                "Thứ Bảy",
                "Chủ Nhật",
              ]}
            />
          </Card>
        ) : (
          <Card>
            <div className="p-8 text-center">
              <Typography.Text type="secondary">
                Please select a teacher and click Search to view the calendar
              </Typography.Text>
            </div>
          </Card>
        )}

        {/* Busy Schedule Modal */}
        <CustomDrawer
          title="Create Busy Schedule"
          open={isBusyScheduleModalOpen}
          onCancel={handleCloseBusyScheduleModal}
          onSubmit={busyScheduleForm.handleSubmit(onSubmitBusySchedule)}
          loading={isCreatingBusySchedule}
        >
          <div className="flex flex-col gap-4">
            <CustomInput
              control={busyScheduleForm.control}
              name="name"
              label="Request Name"
              placeholder="Enter request name"
              size="large"
              required
            />

            <CustomInput
              control={busyScheduleForm.control}
              name="description"
              label="Description"
              placeholder="Enter description (optional)"
              size="large"
            />

            <CustomTextArea
              control={busyScheduleForm.control}
              name="reason"
              label="Reason"
              placeholder="Enter reason for busy schedule"
              size="large"
              required
            />

            <Divider orientation="left">Schedule Details</Divider>

            {/* Date picker */}
            <CustomDatePicker
              control={busyScheduleForm.control}
              name="date"
              label="Date"
              placeholder="Select date"
              required
            />

            {/* Time range */}
            <div className="flex gap-2">
              <CustomTimePicker
                control={busyScheduleForm.control}
                name="startTime"
                label="Start Time"
                placeholder="Start time"
                required
                className="flex-1"
              />
              <CustomTimePicker
                control={busyScheduleForm.control}
                name="endTime"
                label="End Time"
                placeholder="End time"
                required
                className="flex-1"
              />
            </div>
          </div>
        </CustomDrawer>

        {/* Event Detail Modal */}
        <Modal
          title={dayjs(selectedDate).format("MMMM D, YYYY")}
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={[
            <CustomButton
              key="close"
              title="Close"
              onClick={() => setIsDetailModalOpen(false)}
            />,
          ]}
        >
          {selectedEvents.length ? (
            <div className="max-h-[60vh] overflow-y-auto">
              {selectedEvents.map((event) => (
                <Card key={event.id} className="mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Typography.Title level={5}>
                        {event.title}
                      </Typography.Title>
                      <Typography.Text type="secondary">
                        {dayjs(event.startDate).format("HH:mm")} -{" "}
                        {dayjs(event.endDate).format("HH:mm")}
                      </Typography.Text>
                      {event.type && (
                        <div className="mt-2">
                          <Tag color={SCHEDULE_TYPE_TAG[event.type]}>
                            {SCHEDULE_TYPE_LABEL[event.type]}
                          </Tag>
                        </div>
                      )}
                    </div>
                  </div>
                  {event.description && (
                    <div className="mt-2">
                      <Typography.Text type="secondary">
                        {event.description}
                      </Typography.Text>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Typography.Text type="secondary">
                No events for this day
              </Typography.Text>
            </div>
          )}
        </Modal>
      </div>
    </PageLayout>
  );
};

export default Calendar;
