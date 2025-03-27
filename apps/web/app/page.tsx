"use client";
import Loading from "@web/components/common/Loading";
import { ROLE_NAME } from "@web/constants/user";
import { RootState } from "@web/libs/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      switch (user.role.roleName) {
        case ROLE_NAME.ADMIN:
        case ROLE_NAME.STAFF:
          router.push("/ops");
          break;
        default:
          router.push("/lms");
      }
    }
  }, []);

  return <Loading />;
};

export default Home;
