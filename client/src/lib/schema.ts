// Minimal User type for frontend - mirrors the backend User type
export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isPremium: boolean;
  premiumPurchasedAt: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
