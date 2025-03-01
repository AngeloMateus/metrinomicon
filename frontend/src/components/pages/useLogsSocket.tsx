import { useSession } from "@/context/session";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { getApiBase, isDev } from "../util";

export const useLogsSocket = (enabled: boolean) => {
  const session = useSession();
  const [streamLogs, setStreamLogs] = useState<Request[]>([]);
  const { sendMessage, readyState } = useWebSocket(
    enabled ? `${getApiBase(true)}/requests-ws` : null,
    {
      share: true,
      reconnectAttempts: 1,
      retryOnError: false,
      onOpen: () => {
        sendMessage(session?.session?.token ?? "");
      },
      onMessage: message => {
        if (message?.data) {
          setStreamLogs(JSON.parse(message.data));
        }
      },
      shouldReconnect: res => {
        if (res.reason === "Authentication failed") {
          return false;
        }
        return true;
      },
    },
  );

  useEffect(() => {
    const connectionStatus = {
      [ReadyState.CONNECTING]: "Connecting",
      [ReadyState.OPEN]: "Open",
      [ReadyState.CLOSING]: "Closing",
      [ReadyState.CLOSED]: "Closed",
      [ReadyState.UNINSTANTIATED]: "Uninstantiated",
    }[readyState];
    if (isDev) console.log(connectionStatus);
  }, [readyState]);

  useEffect(() => {
    if (!enabled) {
      setStreamLogs([]);
    }
  }, [enabled]);

  return { streamLogs };
};
