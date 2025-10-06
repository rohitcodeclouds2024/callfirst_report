"use client";

import { useEffect } from "react";
import { setAuthToken } from "@/lib/axios";
import { useSession } from "next-auth/react";

export default function AssignAuthToken() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.token) {
      setAuthToken(session.user.token);
      console.log("[AssignAuthToken] axios auth header set");
    } else {
      setAuthToken(null);
      console.warn(
        "[AssignAuthToken] no token found; requests unauthenticated"
      );
    }
  }, [session?.user?.token]);

  return null; // nothing to render
}
