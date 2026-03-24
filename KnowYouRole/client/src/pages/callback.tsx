import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "wouter";

export default function Callback() {
  const { handleRedirectCallback, isAuthenticated, isLoading } = useAuth0();
  const [, setLocation] = useHistory();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        await handleRedirectCallback();
      } catch (err: any) {
        console.error("Auth0 callback error:", err);
        setError(err.message || "Sign-in failed");
      }
    }

    if (!isLoading && !isAuthenticated) {
      processCallback();
    }
  }, [isLoading, isAuthenticated, handleRedirectCallback]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Successfully authenticated — redirect to home or intended destination
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="text-center max-w-md p-6">
          <p className="text-red-400 text-sm mb-2">Sign-in failed</p>
          <p className="text-white/60 text-xs">{error}</p>
          <button
            onClick={() => setLocation("/")}
            className="mt-4 px-4 py-2 bg-[#67E8F9] text-black text-sm rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#67E8F9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#67E8F9] text-sm font-medium">Signing you in...</p>
      </div>
    </div>
  );
}
