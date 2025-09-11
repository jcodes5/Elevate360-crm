"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, logout, needsOnboarding } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        if (isAuthenticated) {
          // Validate token by pinging a lightweight endpoint. If unauthorized, log out.
          try {
            await apiClient.get("/test");
          } catch (error: any) {
            if (error.message === "UNAUTHORIZED") {
              await logout();
              router.push("/auth/login");
              return;
            }
          }

          // If user needs onboarding and is not already on the onboarding page, redirect.
          if (needsOnboarding) {
            if (!pathname?.startsWith("/onboarding")) {
              router.push("/onboarding");
              return;
            }
          }
        } else {
          // Not authenticated: redirect to login unless already on an auth route
          const publicPaths = [
            "/auth/login",
            "/auth/register",
          ];
          const isPublic = publicPaths.some((p) => pathname?.startsWith(p));
          if (!isPublic) {
            router.push("/auth/login");
            return;
          }
        }

        setIsCheckingAuth(false);
      }
    };

    checkAuth();
    // We intentionally only depend on these values
  }, [
    isAuthenticated,
    isLoading,
    logout,
    needsOnboarding,
    pathname,
    router,
  ]);

  // While we check auth, render a consistent wrapper to avoid DOM conflicts
  if (isLoading || isCheckingAuth) {
    return <div style={{ display: 'none' }} />;
  }

  return <>{children}</>;
}
