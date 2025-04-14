import { HomeOutlined, ProfileOutlined, UserOutlined } from "@ant-design/icons";
import { NAV_LINK, NAV_TITLE } from "@web/constants/nav";
import { RootState } from "@web/libs/store";
import { MenuItem, NavigationItem } from "@web/types/common";
import { canAccessLMS, canAccessOPS } from "@web/utils/permissions";
import { Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";
import { useSelector } from "react-redux";

// Shared profile item for both menus
const myProfileItem: NavigationItem = {
  key: NAV_LINK.MY_PROFILE,
  icon: <ProfileOutlined />,
  label: NAV_TITLE.MY_PROFILE,
  url: NAV_LINK.MY_PROFILE,
};

const OPSNavigationItems: NavigationItem[] = [
  {
    key: NAV_LINK.OPS,
    icon: <HomeOutlined />,
    label: NAV_TITLE.HOME,
    url: NAV_LINK.OPS,
  },
  {
    key: NAV_LINK.USER_LIST,
    icon: <UserOutlined />,
    label: NAV_TITLE.USER_LIST,
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
  myProfileItem,
];

const LMSNavigationItems: NavigationItem[] = [
  {
    key: NAV_LINK.LMS,
    icon: <HomeOutlined />,
    label: NAV_TITLE.HOME,
    url: NAV_LINK.LMS,
  },
  myProfileItem,
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
    const userMenuType = canAccessOPS(user)
      ? "OPS"
      : canAccessLMS(user)
        ? "LMS"
        : null;

    // Return early if user has no valid menu type
    if (!userMenuType) return [];

    // Now check the current path
    const inMyProfileSection = pathname?.startsWith(NAV_LINK.MY_PROFILE);
    const inLMSSection = pathname?.startsWith(NAV_LINK.LMS);
    const inOPSSection = pathname?.startsWith(NAV_LINK.OPS);

    // For My Profile, show menu based on user's role type
    if (inMyProfileSection) {
      return userMenuType === "OPS"
        ? transformToMenuItems(OPSNavigationItems)
        : transformToMenuItems(LMSNavigationItems);
    }

    // For other sections, only show if user has access
    if (inLMSSection && canAccessLMS(user)) {
      return transformToMenuItems(LMSNavigationItems);
    }

    if (inOPSSection && canAccessOPS(user)) {
      return transformToMenuItems(OPSNavigationItems);
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
