import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Callback() {
  const { handleRedirectCallback, isAuthenticated, isLoading } = useAuth0();
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
      window.location.href = "/";
    }
  }, [isLoading, isAuthenticated]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#03045e]">
        <div className="text-center max-w-md p-6 glass rounded-2xl">
          <p className="text-red-400 text-sm mb-2">Sign-in failed</p>
          <p className="text-white/60 text-xs">{error}</p>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="mt-4 px-4 py-2 text-black text-sm rounded-lg cursor-pointer"
            style={{ background: '#00D4FF' }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#03045e]">
      <div className="text-center">
        <div
          className="w-8 h-8 border-2 mx-auto mb-4 rounded-full animate-spin"
          style={{ borderColor: '#00D4FF', borderTopColor: 'transparent' }}
        />
        <p className="text-[#00D4FF] text-sm font-medium">Signing you in...</p>
      </div>
    </div>
  );
}
