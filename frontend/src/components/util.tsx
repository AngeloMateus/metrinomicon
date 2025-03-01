import { useState } from "react";

export function getApiBase(isSocket = false) {
  const BASE_URL = process.env.NEXT_PUBLIC_API;
  return `${isSocket ? BASE_URL?.replace("http", "ws").replace("https", "wss") : BASE_URL}`;
}

export const useForceUpdate = () => {
  const [, setState] = useState<unknown>();
  return () => setState({});
};

export const isDev = process.env.NODE_ENV === "development";

export function getStatusColor(status: number) {
  switch (true) {
    case status >= 100 && status < 200:
      return "text-blue-500";
    case status >= 200 && status < 300:
      return "text-green-400";
    case status >= 300 && status < 400:
      return "text-yellow-500";
    case status >= 400 && status < 500:
      return "text-orange-300";
    case status >= 500:
      return "text-red-400";
    default:
      return "text-admin-text-light";
  }
}

export const PrettyPrintJson = ({ data }: { data: unknown }) => {
  // (destructured) data could be a prop for example
  return (
    <div className="flex font-mono text-sm ">
      <pre className="flex text-wrap break-all">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const formatResponseTime = (milliseconds: number): string => {
  if (milliseconds > 1000) {
    return `${(milliseconds / 1000).toFixed(2)} s`;
  }
  return `${milliseconds.toFixed(0)} ms`;
};

export const parsePathName = (url: string) => {
  return URL.canParse(url) ? new URL(url).pathname : url;
};
