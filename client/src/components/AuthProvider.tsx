"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import type { ReactNode } from "react";

const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || "https://knowyourole.com/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!domain || !clientId) {
    // Keep public quiz routes available in deliberately unconfigured local builds.
    // Auth-dependent UI exposes its configuration error instead of silently
    // pretending that a cookie session exists.
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        audience,
        redirect_uri: typeof window === "undefined" ? undefined : `${window.location.origin}/callback`,
      }}
      cacheLocation="memory"
    >
      {children}
    </Auth0Provider>
  );
}

export const auth0Audience = audience;
