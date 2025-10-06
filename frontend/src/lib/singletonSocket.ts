// lib/singletonSocket.ts
import { io, Socket } from "socket.io-client";

let _socket: Socket | null = null;

export function getOrCreateSocket(baseUrl?: string, jwtToken?: string): Socket {
  if (_socket && _socket.connected) return _socket;

  const url = baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const opts: any = {
    autoConnect: true,
    transports: ["websocket"],
    withCredentials: true,
  };
  if (jwtToken) {
    opts.auth = { token: jwtToken };
  }

  _socket = io(url, opts);

  // default debug logs (optional)
  _socket.on("connect_error", (err: any) => {
    console.error("[singletonSocket] connect_error", err);
  });
  _socket.on("error", (err: any) => {
    console.warn("[singletonSocket] error", err);
  });

  return _socket;
}

export function resetSocket() {
  try {
    if (_socket) {
      _socket.off();
      _socket.disconnect();
      _socket = null;
    }
  } catch (e) {
    console.warn("resetSocket error", e);
    _socket = null;
  }
}
