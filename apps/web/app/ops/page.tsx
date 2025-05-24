"use client";
import {
  BookOutlined,
  CalendarOutlined,
  HomeOutlined,
  PlusOutlined,
  RiseOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import PageLayout from "@web/layouts/PageLayout";
import { MAX_LIMIT_REQUEST } from "@web/libs/common";
import { useGetClassesQuery } from "@web/libs/features/classes/classApi";
import { useGetCoursesQuery } from "@web/libs/features/courses/courseApi";
import { useGetRoomsQuery } from "@web/libs/features/rooms/roomApi";
import {
  useGetStudentsQuery,
  useGetTeachersQuery,
} from "@web/libs/features/users/userApi";
import { NAV_LINK, NAV_TITLE } from "@web/libs/nav";
import { RootState } from "@web/libs/store";
import { UserStatus } from "@web/libs/user";
import { Card, Col, Row, Statistic, Typography } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

const breadcrumbs: ItemType[] = [
  {
    title: NAV_TITLE.HOME,
  },
];

const HomeOPS = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // Fetch data for statistics
  const { data: studentsData } = useGetStudentsQuery({
    limit: MAX_LIMIT_REQUEST,
  });
  const { data: teachersData } = useGetTeachersQuery({
    limit: MAX_LIMIT_REQUEST,
  });
  const { data: classesData } = useGetClassesQuery({
    limit: MAX_LIMIT_REQUEST,
  });
  const { data: coursesData } = useGetCoursesQuery({
    limit: MAX_LIMIT_REQUEST,
  });
  const { data: roomsData } = useGetRoomsQuery({ limit: MAX_LIMIT_REQUEST });

  // Calculate statistics
  const statistics = useMemo(() => {
    return {
      totalStudents: studentsData?.data?.total || 0,
      totalTeachers: teachersData?.data?.total || 0,
      totalClasses: classesData?.data?.total || 0,
      totalCourses: coursesData?.data?.total || 0,
      totalRooms: roomsData?.data?.total || 0,
      activeClasses:
        classesData?.data?.items?.filter(
          (cls) => cls.status === UserStatus.ACTIVE,
        ).length || 0,
    };
  }, [studentsData, teachersData, classesData, coursesData, roomsData]);

  const quickActions = [
    {
      title: "Tạo Lớp Học Mới",
      description: "Thêm lớp học vào hệ thống",
      icon: <PlusOutlined />,
      color: "#1890ff",
      link: NAV_LINK.MANAGE_CLASSES,
    },
    {
      title: "Quản Lý Người Dùng",
      description: "Thêm/sửa học viên và giáo viên",
      icon: <TeamOutlined />,
      color: "#52c41a",
      link: NAV_LINK.STUDENT_LIST,
    },
    {
      title: "Xem Lịch Giảng Dạy",
      description: "Kiểm tra lịch trình các lớp",
      icon: <CalendarOutlined />,
      color: "#faad14",
      link: NAV_LINK.MANAGE_CALENDAR,
    },
    {
      title: "Cài Đặt Hệ Thống",
      description: "Cấu hình khóa học và phòng học",
      icon: <SettingOutlined />,
      color: "#f5222d",
      link: NAV_LINK.MANAGE_COURSES,
    },
  ];

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* Welcome Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="mb-2">
                {`Chào mừng ${user?.fullName}!`}
              </Title>
              <Text type="secondary" className="text-lg">
                Quản lý hệ thống giáo dục hiệu quả -{" "}
                {dayjs().format("dddd, DD/MM/YYYY")}
              </Text>
            </div>
            <HomeOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
          </div>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Học Viên"
                value={statistics.totalStudents}
                prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Giáo Viên"
                value={statistics.totalTeachers}
                prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Lớp Học"
                value={statistics.totalClasses}
                prefix={<BookOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Lớp Đang Hoạt Động"
                value={statistics.activeClasses}
                prefix={<RiseOutlined style={{ color: "#13c2c2" }} />}
                valueStyle={{ color: "#13c2c2" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Khóa Học"
                value={statistics.totalCourses}
                prefix={<BookOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Phòng Học"
                value={statistics.totalRooms}
                prefix={<HomeOutlined style={{ color: "#eb2f96" }} />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Quick Actions */}
          <Col xs={24} lg={12}>
            <Card title={NAV_TITLE.QUICK_ACTIONS}>
              <Row gutter={[16, 16]}>
                {quickActions.map((action, index) => (
                  <Col xs={24} sm={12} key={index}>
                    <Card
                      hoverable
                      size="small"
                      onClick={() => router.push(action.link)}
                      className="text-center"
                    >
                      <div
                        style={{
                          color: action.color,
                          fontSize: "24px",
                          marginBottom: "8px",
                        }}
                      >
                        {action.icon}
                      </div>
                      <Title level={5} style={{ margin: "8px 0 4px 0" }}>
                        {action.title}
                      </Title>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {action.description}
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </PageLayout>
  );
};

export default HomeOPS;
