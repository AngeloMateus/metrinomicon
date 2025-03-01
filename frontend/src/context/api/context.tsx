import { UptimeType } from "@/enums/uptime";
import { UseMutationResult, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import React, { createContext, ReactElement, useContext } from "react";
import { apiRequests } from "./queries";

export const ApiContext = createContext<ApiContextInterface>({} as ApiContextInterface);

interface ApiContextInterface {
  getStats: (fromDate: string, options?: TQueryOptions) => UseQueryResult<[], unknown>;
  status: () => UseQueryResult<boolean, unknown>;
  getRequests: (
    params: RequestsParams,
    options?: TQueryOptions,
  ) => UseQueryResult<RequestsResponse, Error>;
  getStatsByStatus: (
    fromDate: string,
    options?: TQueryOptions,
  ) => UseQueryResult<RequestsByStatus[], Error>;
  getUptime: (
    uptimeType: UptimeType,
    options?: TQueryOptions,
  ) => UseQueryResult<UptimeResponse[], Error>;
  getUptimeSettings: (options?: TQueryOptions) => UseQueryResult<UptimeSetting[], Error>;
  getSearchSuggestions: (params: GetSearchSuggestionsParams) => UseQueryResult<[], Error>;
  getSLIs: (
    params: GetSLIs,
    options?: TQueryOptions,
  ) => UseQueryResult<ServiceLevelIndicator, Error>;
  postUptimeSettings: (
    options?: TQueryOptions,
  ) => UseMutationResult<MessageResponse, Error, UptimeSetting, unknown>;
  removeUptimeSettings: (
    options?: TQueryOptions,
  ) => UseMutationResult<MessageResponse, Error, string, unknown>;
}

export const ApiProvider = ({ children }: { children: ReactElement | React.ReactNode }) => {
  const client = useQueryClient();
  const api = apiRequests(client);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
  return useContext(ApiContext);
};
