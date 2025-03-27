"use client";
import { useGetMeQuery } from "@web/libs/features/auth/authApi";
import { RootState } from "@web/libs/store";
import { getToken } from "@web/libs/tokens";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Loading from "./common/Loading";

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const accessToken = getToken();
  const { isLoading } = useGetMeQuery(
    {
      accessToken,
    },
    {
      skip: !!user || !accessToken,
    },
  );

  useEffect(() => {
    if (!user && !accessToken) {
      return router.push("/login");
    }
  }, [user, accessToken, router]);

  if (pathname === "/login") return children;

  if (!user || isLoading) {
    return <Loading />;
  }

  return children;
};

export default RouteGuard;
