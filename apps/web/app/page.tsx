"use client";
import Loading from "@web/components/common/Loading";
import { RoleName } from "@web/enums/role";
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
        case RoleName.ADMIN:
        case RoleName.RECEPTIONIST:
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
