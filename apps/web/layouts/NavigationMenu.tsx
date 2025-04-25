import {
  CalendarOutlined,
  FileTextOutlined,
  FormOutlined,
  HomeOutlined,
  ProfileOutlined,
  ReadOutlined,
  ScheduleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { AccessRole, MenuItem, NavigationItem } from "@web/libs/common";
import { NAV_LINK, NAV_TITLE } from "@web/libs/nav";
import {
  canAccessLMS,
  canAccessOPS,
  canAccessStudent,
} from "@web/libs/permissions";
import { RootState } from "@web/libs/store";
import { Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";
import { useSelector } from "react-redux";

const OPSNavigationItems: NavigationItem[] = [
  {
    key: NAV_LINK.OPS,
    icon: <HomeOutlined />,
    label: NAV_TITLE.HOME,
    url: NAV_LINK.OPS,
  },
  {
    key: NAV_LINK.MY_PROFILE,
    icon: <ProfileOutlined />,
    label: NAV_TITLE.MY_PROFILE,
    url: NAV_LINK.MY_PROFILE,
  },
  {
    key: NAV_LINK.MANAGE_CALENDAR,
    icon: <CalendarOutlined />,
    label: NAV_TITLE.MANAGE_CALENDAR,
    url: NAV_LINK.MANAGE_CALENDAR,
  },
  {
    key: NAV_LINK.MANAGE_ROOMS,
    icon: <HomeOutlined />,
    label: NAV_TITLE.MANAGE_ROOMS,
    url: NAV_LINK.MANAGE_ROOMS,
  },
  {
    key: NAV_LINK.MANAGE_USERS,
    icon: <UserOutlined />,
    label: NAV_TITLE.MANAGE_USERS,
    children: [
      {
        label: NAV_TITLE.TEACHER_LIST,
        url: NAV_LINK.TEACHER_LIST,
      },
      {
        label: NAV_TITLE.RECEPTIONIST_LIST,
        url: NAV_LINK.RECEPTIONIST_LIST,
      },
    ],
  },

  {
    key: NAV_LINK.MANAGE_REQUESTS,
    icon: <FormOutlined />,
    label: NAV_TITLE.MANAGE_REQUESTS,
    children: [
      {
        key: NAV_LINK.WEEKLY_NORM_LIST,
        label: NAV_TITLE.WEEKLY_NORM_LIST,
        url: NAV_LINK.WEEKLY_NORM_LIST,
      },
      {
        key: NAV_LINK.TIME_OFF_LIST,
        label: NAV_TITLE.TIME_OFF_LIST,
        url: NAV_LINK.TIME_OFF_LIST,
      },
      {
        key: NAV_LINK.BUSY_SCHEDULE_LIST,
        label: NAV_TITLE.BUSY_SCHEDULE_LIST,
        url: NAV_LINK.BUSY_SCHEDULE_LIST,
      },
      {
        key: NAV_LINK.TEACHING_MODE_LIST,
        label: NAV_TITLE.TEACHING_MODE_LIST,
        url: NAV_LINK.TEACHING_MODE_LIST,
      },
    ],
  },
];

const LMSNavigationItems: NavigationItem[] = [
  {
    key: NAV_LINK.LMS,
    icon: <HomeOutlined />,
    label: NAV_TITLE.HOME,
    url: NAV_LINK.LMS,
  },
  {
    key: NAV_LINK.MY_PROFILE,
    icon: <ProfileOutlined />,
    label: NAV_TITLE.MY_PROFILE,
    url: NAV_LINK.MY_PROFILE,
  },
  {
    key: NAV_LINK.MY_CALENDAR,
    icon: <CalendarOutlined />,
    label: NAV_TITLE.MY_CALENDAR,
    url: NAV_LINK.MY_CALENDAR,
  },
  {
    key: NAV_LINK.MY_CLASS,
    icon: <ReadOutlined />,
    label: NAV_TITLE.MY_CLASS,
    url: `${NAV_LINK.LMS}${NAV_LINK.MY_CLASS}`,
  },
  {
    key: NAV_LINK.WEEKLY_NORM_REGISTRATION,
    icon: <ScheduleOutlined />,
    label: NAV_TITLE.WEEKLY_NORM_REGISTRATION,
    url: NAV_LINK.WEEKLY_NORM_REGISTRATION,
  },
  {
    key: NAV_LINK.TIME_OFF_REGISTRATION,
    icon: <FileTextOutlined />,
    label: NAV_TITLE.TIME_OFF_REGISTRATION,
    url: NAV_LINK.TIME_OFF_REGISTRATION,
  },
];

const StudentNavigationItems: NavigationItem[] = [
  {
    key: NAV_LINK.STUDENT,
    icon: <HomeOutlined />,
    label: NAV_TITLE.HOME,
    url: NAV_LINK.STUDENT,
  },
  {
    key: NAV_LINK.MY_PROFILE,
    icon: <ProfileOutlined />,
    label: NAV_TITLE.MY_PROFILE,
    url: NAV_LINK.MY_PROFILE,
  },
  {
    key: NAV_LINK.MY_CLASS,
    icon: <ReadOutlined />,
    label: NAV_TITLE.MY_CLASS,
    url: `${NAV_LINK.STUDENT}${NAV_LINK.MY_CLASS}`,
  },
];

const transformToMenuItems = (
  items?: NavigationItem[],
): MenuItem[] | undefined => {
  if (!items) return undefined;

  return items.map((item) => {
    const labelNode = item.url ? (
      <Link href={item.url}>{item.label}</Link>
    ) : (
      item.label
    );

    return {
      key: item.key ?? item.url,
      icon: item.icon,
      label: labelNode,
      children: items ? transformToMenuItems(item.children) : undefined,
    } as MenuItem;
  });
};

const NavigationMenu = () => {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = useMemo(() => {
    if (!user) return [];

    // First determine which kind of menu to show based on user role
    let userMenuType: AccessRole | null = null;
    if (canAccessOPS(user)) {
      userMenuType = AccessRole.OPS;
    } else if (canAccessLMS(user)) {
      userMenuType = AccessRole.LMS;
    } else if (canAccessStudent(user)) {
      userMenuType = AccessRole.STUDENT;
    }

    // Return early if user has no valid menu type
    if (!userMenuType) return [];

    // Now check the current path
    const inMyProfileSection = pathname?.startsWith(NAV_LINK.MY_PROFILE);
    const inLMSSection = pathname?.startsWith(NAV_LINK.LMS);
    const inOPSSection = pathname?.startsWith(NAV_LINK.OPS);
    const inStudentSection = pathname?.startsWith(NAV_LINK.STUDENT);

    // For My Profile, show menu based on user's role type
    if (inMyProfileSection) {
      if (userMenuType === AccessRole.OPS)
        return transformToMenuItems(OPSNavigationItems);
      if (userMenuType === AccessRole.LMS)
        return transformToMenuItems(LMSNavigationItems);
      return transformToMenuItems(StudentNavigationItems);
    }

    // For other sections, only show if user has access
    if (inLMSSection && canAccessLMS(user)) {
      return transformToMenuItems(LMSNavigationItems);
    }

    if (inOPSSection && canAccessOPS(user)) {
      return transformToMenuItems(OPSNavigationItems);
    }

    if (inStudentSection && canAccessStudent(user)) {
      return transformToMenuItems(StudentNavigationItems);
    }

    return [];
  }, [pathname, user]);

  const openKeys = useMemo(() => {
    if (!pathname) return [];

    const pathSegments = pathname.split("/").filter(Boolean);
    const openKeys: string[] = [];

    let currentPath = "";
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      openKeys.push(currentPath);
    }
    return openKeys;
  }, [pathname]);

  return (
    <Menu
      theme="dark"
      mode="inline"
      items={menuItems}
      defaultSelectedKeys={[pathname]}
      defaultOpenKeys={openKeys}
    />
  );
};

export default memo(NavigationMenu);
