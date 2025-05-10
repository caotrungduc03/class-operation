"use client";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@web/components/common/CustomButton";
import CustomDatePicker from "@web/components/common/CustomDatePicker";
import CustomInput from "@web/components/common/CustomInput";
import CustomSelect from "@web/components/common/CustomSelect";
import CustomTextArea from "@web/components/common/CustomTextArea";
import FilterGrid from "@web/components/common/FilterGrid";
import Loading from "@web/components/common/Loading";
import { SHIFTS_OPTIONS } from "@web/libs/class";
import {
  useGetClassByIdQuery,
  useGetClassSchedulesQuery,
} from "@web/libs/features/classes/classApi";
import {
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
} from "@web/libs/features/schedules/scheduleApi";
import {
  CreateTeachingScheduleDto,
  SCHEDULE_TYPE_LABEL,
  SCHEDULE_TYPE_TAG,
} from "@web/libs/schedule";
import { Alert, Card, Modal, Popconfirm, Tag, Typography } from "antd";
import AntdCalendar from "antd-calendar";
import { EventType } from "antd-calendar/dist/constants";
import { IEvent } from "antd-calendar/dist/types";
import dayjs, { Dayjs } from "dayjs";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

// Define validation schema
const searchFormSchema = z.object({
  startDate: z.any().optional(),
  endDate: z.any().optional(),
});

// Define types based on the schema
type SearchFormValues = z.infer<typeof searchFormSchema>;

// Define schedule form schema
const scheduleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  startDate: z.any().refine((val) => !!val, "Start date is required"),
  endDate: z.any().refine((val) => !!val, "End date is required"),
  shift: z.string().min(1, "Shift is required"),
});

// Define types for schedule form
type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const ClassCalendar = () => {
  const { id: classId } = useParams<{ id: string }>();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<IEvent[]>([]);

  const [dateRange, setDateRange] = useState({
    startDate: dayjs()
      .startOf("month")
      .startOf("week")
      .add(1, "day")
      .toISOString(),
    endDate: dayjs().endOf("month").add(1, "day").add(1, "day").toISOString(),
  });

  // Fetch class details to check if teacher is assigned
  const { data: classData, isLoading: isLoadingClass } = useGetClassByIdQuery(
    classId,
    {
      skip: !classId,
    },
  );

  const hasTeacher = classData?.data?.teacher?.id;
  const classStartDate = classData?.data?.startDate
    ? dayjs(classData.data.startDate)
    : null;
  const classEndDate = classData?.data?.endDate
    ? dayjs(classData.data.endDate)
    : null;

  const {
    data: scheduleData,
    isLoading,
    refetch,
  } = useGetClassSchedulesQuery(
    {
      classId,
      ...dateRange,
    },
    {
      skip: !classId || !hasTeacher,
    },
  );

  // Setup form with zod resolver
  const { control, handleSubmit, reset } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
  });

  // Setup schedule form with zod resolver
  const scheduleForm = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
  });

  const [createSchedule, { isLoading: isCreatingSchedule }] =
    useCreateScheduleMutation();
  const [deleteSchedule, { isLoading: isDeleting }] =
    useDeleteScheduleMutation();

  const events = useMemo(() => {
    if (!scheduleData?.data) return [];

    return scheduleData.data.map((schedule) => ({
      id: schedule.id,
      title: schedule.name || "Class Session",
      startDate: dayjs(schedule.startDate).toDate(),
      endDate: dayjs(schedule.endDate).toDate(),
      type: schedule.type as unknown as EventType,
      description: schedule.description,
    }));
  }, [scheduleData]);

  const handleOpenDetail = useCallback((date: Date, events: IEvent[]) => {
    setSelectedDate(date);
    setSelectedEvents(events);
    setIsDetailModalOpen(true);
  }, []);

  const handleRefetchAPI = useCallback(
    async (startDate: Date, endDate: Date) => {
      const newStartDate = dayjs(startDate).toISOString();
      const newEndDate = dayjs(endDate).toISOString();

      setDateRange({
        startDate: newStartDate,
        endDate: newEndDate,
      });

      return Promise.resolve();
    },
    [],
  );

  const onSubmitSearch = (data: SearchFormValues) => {
    const newRange = {
      startDate: data.startDate
        ? dayjs(data.startDate).toISOString()
        : undefined,
      endDate: data.endDate ? dayjs(data.endDate).toISOString() : undefined,
    };

    setDateRange({
      startDate: newRange.startDate || dateRange.startDate,
      endDate: newRange.endDate || dateRange.endDate,
    });
  };

  const handleReset = () => {
    reset();
    setDateRange({
      startDate: dayjs().startOf("month").toISOString(),
      endDate: dayjs().endOf("month").toISOString(),
    });
  };

  const handleOpenAddSchedule = () => {
    if (!hasTeacher) {
      toast.error(
        "Please assign a teacher to this class before adding schedules.",
      );
      return;
    }

    scheduleForm.reset({
      name: classData?.data?.name || "Class Session",
      description: "",
      startDate: null,
      endDate: null,
      shift: undefined,
    });
    setIsAddScheduleModalOpen(true);
  };

  const handleAddSchedule = async (data: ScheduleFormValues) => {
    try {
      const selectedShift = SHIFTS_OPTIONS.find(
        (shift) => shift.value === data.shift,
      );

      if (!selectedShift || !classId) return;

      // Get start and end dates
      const startDate = dayjs(data.startDate);
      const endDate = dayjs(data.endDate);

      // For each day in the range
      const schedulesPromises = [];
      let currentDate = startDate;

      while (currentDate.isSame(endDate) || currentDate.isBefore(endDate)) {
        // Combine date with times
        const scheduleStartDate = dayjs(
          currentDate.format("YYYY-MM-DD") + " " + selectedShift.startTime,
        );
        const scheduleEndDate = dayjs(
          currentDate.format("YYYY-MM-DD") + " " + selectedShift.endTime,
        );

        const scheduleData: CreateTeachingScheduleDto = {
          name: data.name,
          description: data.description,
          startDate: scheduleStartDate.toDate(),
          endDate: scheduleEndDate.toDate(),
          classId: classId,
        };

        schedulesPromises.push(createSchedule(scheduleData).unwrap());
        currentDate = currentDate.add(1, "day");
      }

      await Promise.all(schedulesPromises);

      toast.success("Teaching schedule(s) created successfully");
      setIsAddScheduleModalOpen(false);
      refetch();
    } catch (error) {
      // Handled by the apiErrorMiddleware
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteSchedule(scheduleId).unwrap();
      toast.success("Schedule deleted successfully");
      refetch();
    } catch (error) {
      // Error will be handled by middleware
    }
  };

  const canDeleteSchedule = useCallback((date: Date) => {
    // Can only delete schedules that are in the future
    return dayjs(date).isAfter(dayjs());
  }, []);

  const disabledDate = (current: Dayjs) => {
    // Disable dates outside class start and end date range
    if (!classStartDate || !classEndDate) return false;

    return (
      current.isBefore(classStartDate, "day") ||
      current.isAfter(classEndDate, "day")
    );
  };

  if (isLoading || isLoadingClass) return <Loading />;

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">
            Class Calendar
          </Typography.Title>
          <CustomButton
            type="primary"
            title="Add Schedule"
            icon={<PlusOutlined />}
            onClick={handleOpenAddSchedule}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {!hasTeacher && (
          <Alert
            message="Teacher Assignment Required"
            description="Please assign a teacher to this class before scheduling. Without a teacher, the class schedule cannot be properly managed."
            type="warning"
            showIcon
            className="mb-4"
          />
        )}

        <FilterGrid>
          <CustomDatePicker
            control={control}
            name="startDate"
            size="large"
            placeholder="Start date"
            label="Start Date"
          />
          <CustomDatePicker
            control={control}
            name="endDate"
            size="large"
            placeholder="End date"
            label="End Date"
          />
        </FilterGrid>
        <div className="flex justify-between">
          <div className="flex gap-4">
            <CustomButton title="Reset" size="large" onClick={handleReset} />
            <CustomButton
              type="primary"
              title="Search"
              size="large"
              onClick={handleSubmit(onSubmitSearch)}
            />
          </div>
        </div>

        <AntdCalendar
          events={events}
          onOpenDetail={handleOpenDetail}
          onOpenCreate={() => {}}
          onRefetchAPI={handleRefetchAPI}
          loading={isLoading}
        />

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
                    {canDeleteSchedule(event.startDate) &&
                      event.type === "TEACHING" && (
                        <Popconfirm
                          title="Delete Schedule"
                          description="Are you sure you want to delete this schedule?"
                          onConfirm={() => handleDeleteSchedule(event.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <CustomButton
                            type="text"
                            color="danger"
                            icon={<DeleteOutlined />}
                            loading={isDeleting}
                          />
                        </Popconfirm>
                      )}
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

        {/* Add Schedule Modal */}
        <Modal
          title="Add Teaching Schedule"
          open={isAddScheduleModalOpen}
          onCancel={() => setIsAddScheduleModalOpen(false)}
          footer={[
            <CustomButton
              key="cancel"
              title="Cancel"
              onClick={() => setIsAddScheduleModalOpen(false)}
            />,
            <CustomButton
              key="submit"
              type="primary"
              title="Add Schedule"
              onClick={scheduleForm.handleSubmit(handleAddSchedule)}
              loading={isCreatingSchedule}
            />,
          ]}
        >
          <div className="flex flex-col gap-4 py-4">
            <CustomInput
              control={scheduleForm.control}
              name="name"
              label="Schedule Name"
              placeholder="Enter schedule name"
              required
            />

            <CustomTextArea
              control={scheduleForm.control}
              name="description"
              label="Description"
              placeholder="Enter schedule description"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CustomDatePicker
                control={scheduleForm.control}
                name="startDate"
                label="Start Date"
                placeholder="Select start date"
                disabledDate={disabledDate}
                required
              />

              <CustomDatePicker
                control={scheduleForm.control}
                name="endDate"
                label="End Date"
                placeholder="Select end date"
                disabledDate={disabledDate}
                required
              />
            </div>

            <CustomSelect
              control={scheduleForm.control}
              name="shift"
              label="Shift"
              placeholder="Select shift"
              options={SHIFTS_OPTIONS.map((shift) => ({
                label: shift.label,
                value: shift.value,
              }))}
              required
            />
          </div>
        </Modal>
      </div>
    </Card>
  );
};

export default ClassCalendar;
