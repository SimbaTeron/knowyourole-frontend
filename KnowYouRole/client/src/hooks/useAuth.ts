import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import type { User } from "@shared/schema";

interface PremiumStatus {
  isPremium: boolean;
  premiumPurchasedAt: string | null;
}

export function useAuth() {
  const { getAccessTokenSilently } = useAuth0();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const res = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch user");
      }
      return res.json();
    },
  });

  const { data: premiumData } = useQuery<PremiumStatus>({
    queryKey: ["/api/user/premium-status"],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const res = await fetch("/api/user/premium-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return { isPremium: false, premiumPurchasedAt: null };
      return res.json();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isPremium: premiumData?.isPremium || false,
    premiumPurchasedAt: premiumData?.premiumPurchasedAt || null,
  };
}
