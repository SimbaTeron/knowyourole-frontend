import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface PremiumStatus {
  isPremium: boolean;
  premiumPurchasedAt: string | null;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: premiumData } = useQuery<PremiumStatus>({
    queryKey: ["/api/user/premium-status"],
    enabled: !!user,
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isPremium: premiumData?.isPremium || false,
    premiumPurchasedAt: premiumData?.premiumPurchasedAt || null,
  };
}
