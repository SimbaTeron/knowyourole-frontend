"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface PremiumStatus {
  isPremium: boolean;
  premiumPurchasedAt: string | null;
}

async function readJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`${response.status}: ${(await response.text()) || response.statusText}`);
  return response.json() as Promise<T>;
}

export function useAuth() {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently, logout } = useAuth0();

  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["auth-user", isAuthenticated],
    enabled: isAuthenticated,
    retry: false,
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      return readJsonOrThrow<User>(await fetch("/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }));
    },
  });

  const { data: premiumData } = useQuery<PremiumStatus>({
    queryKey: ["premium-status", isAuthenticated],
    enabled: isAuthenticated && !!user,
    retry: false,
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      return readJsonOrThrow<PremiumStatus>(await fetch("/api/user/premium-status", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }));
    },
  });

  return {
    user: user ?? null,
    isLoading: authLoading || (isAuthenticated && userLoading),
    isAuthenticated: isAuthenticated && !!user,
    isPremium: premiumData?.isPremium || false,
    premiumPurchasedAt: premiumData?.premiumPurchasedAt || null,
    logout,
  };
}
