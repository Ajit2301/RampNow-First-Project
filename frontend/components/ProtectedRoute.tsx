// components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isTokenValid } from "../utils/auth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!isTokenValid(token) || !email) {
      localStorage.removeItem("token");
      router.push("/login");
    } else {
      setLoading(false); // Allow children to render
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Optional loader or spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute;
