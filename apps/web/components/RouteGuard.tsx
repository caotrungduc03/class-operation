"use client";
import { NAV_LINK } from "@web/libs/nav";
import {
  canAccessLMS,
  canAccessOPS,
  getHomePathForUser,
} from "@web/libs/permissions";
import { RootState } from "@web/libs/store";
import { getToken } from "@web/libs/tokens";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredAccess?: "LMS" | "OPS";
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredAccess,
}) => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getToken();

    // If not authenticated and no token exists, redirect to login
    if (!isAuthenticated && !token) {
      router.replace(NAV_LINK.LOGIN);
      return;
    }

    // Skip access check if no requiredAccess is specified
    if (!requiredAccess) {
      return;
    }

    // If the user is authenticated, check for proper access
    if (isAuthenticated) {
      const hasAccess =
        (requiredAccess === "LMS" && canAccessLMS(user)) ||
        (requiredAccess === "OPS" && canAccessOPS(user));

      if (!hasAccess) {
        const redirectPath = getHomePathForUser(user);
        router.replace(redirectPath);
      }
    }
  }, [user, isAuthenticated, requiredAccess, router, pathname]);

  return <>{children}</>;
};

export default RouteGuard;
