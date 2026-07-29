"use client";

import { useAuth0 } from "@auth0/auth0-react";

export function useAuthenticatedApi() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  return async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    if (!isAuthenticated) throw new Error("Sign in is required");
    const token = await getAccessTokenSilently();
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers, credentials: "include" });
  };
}
