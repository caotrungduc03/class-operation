import { UserOutlined } from "@ant-design/icons";
import { NAV_LINK, NAV_TITLE } from "@web/constants/nav";
import { MenuItem, NavigationItem } from "@web/types/common";
import { Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const navigationItems: NavigationItem[] = [
  {
    key: NAV_LINK.USERS,
    icon: <UserOutlined />,
    label: NAV_TITLE.USERS,
    children: [
      {
        label: NAV_TITLE.TEACHERS,
        url: NAV_LINK.TEACHERS,
      },
      {
        label: NAV_TITLE.RECEPTIONIST,
        url: NAV_LINK.RECEPTIONISTS,
      },
      {
        label: NAV_TITLE.STUDENTS,
        url: NAV_LINK.STUDENTS,
      },
    ],
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

  const menuItems = useMemo(
    () => transformToMenuItems(navigationItems),
    [pathname],
  );

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

export default NavigationMenu;
