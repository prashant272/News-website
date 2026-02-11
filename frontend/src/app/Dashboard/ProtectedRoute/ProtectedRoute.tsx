"use client";

import { useContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/app/Dashboard/Context/ManageUserContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const context = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (!context?.UserAuthData?.token) {
      router.replace("/Dashboard/pages/Auth");
    }
  }, [context, router]);

  if (!context?.UserAuthData?.token) return null;

  return children;
}
