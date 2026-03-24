import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "wouter";

export default function Callback() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();
  const [, setLocation] = useHistory();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // If somehow we're not authenticated after callback, redirect to home
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#67E8F9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#67E8F9] text-sm font-medium">Signing you in...</p>
      </div>
    </div>
  );
}
