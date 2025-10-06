// src/lib/useApi.tsx
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiClient, setAuthToken, enableAutoAuthHandler } from "./axios";

export default function useApi() {
  const { data: session, status } = useSession();

  // If you want to redirect on unauthorized, pass a handler to enableAutoAuthHandler
  useEffect(() => {
    enableAutoAuthHandler();
    // enableAutoAuthHandler returns nothing; if you want to remove interceptor on unmount
    // you'd need to keep the interceptor id and eject it.
  }, []);

  useEffect(() => {
    // session.user.token should be set by your NextAuth callbacks (as you already do)
    const token = (session as any)?.user?.token ?? null;
    // console.log(token);
    setAuthToken(token);
    // Note: do NOT persist raw token into localStorage here if you want short-lived/token rotation.
  }, [session, status]);

  return apiClient;
}
