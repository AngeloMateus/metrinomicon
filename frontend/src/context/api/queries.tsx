import { getApiBase } from "@/components/util";
import { UptimeType } from "@/enums/uptime";
import { QueryClient, skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { omit } from "lodash";
import { useSession } from "../session";
import {
  getRequestsRequest,
  getSearchSuggestionsRequest,
  getServiceLevelIndicatorRequest,
  getStatsRequest,
  getUptimeRequest,
  getUptimeSettingsRequest,
  postUptimeSettingsRequest,
  removeUptimeSettingsRequest,
  statsByStatus,
} from "./requests";

const FIVE_MINUTES_IN_MILLISECONDS = 1000 * 60 * 5;
const TWO_MINUTES_IN_MILLISECONDS = 1000 * 60 * 2;

export const apiRequests = (client: QueryClient) => {
  const { session } = useSession();

  const shouldQuery = !!session?.token;

  const getStats = (fromDate: string, options?: TQueryOptions) =>
    useQuery({
      queryKey: ["stats"],
      queryFn: shouldQuery
        ? async (): Promise<[]> => getStatsRequest(fromDate, session.token)
        : skipToken,
      ...options,
      staleTime: FIVE_MINUTES_IN_MILLISECONDS,
    });

  const status = () =>
    useQuery({
      queryKey: ["status"],
      queryFn: shouldQuery
        ? async (): Promise<boolean> =>
            (
              await fetch(`${getApiBase()}/`, {
                headers: {
                  "ngrok-skip-browser-warning": "true",
                },
              })
            ).json()
        : skipToken,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: FIVE_MINUTES_IN_MILLISECONDS,
    });

  const getRequests = (params: RequestsParams, options?: TQueryOptions) => {
    return useQuery({
      queryKey: ["requests", omit(params, ["to", "from"])],
      queryFn: shouldQuery ? async () => getRequestsRequest(params, session.token) : skipToken,
      refetchInterval: TWO_MINUTES_IN_MILLISECONDS,
      ...options,
    });
  };

  const getStatsByStatus = (from: string, options?: TQueryOptions) =>
    useQuery({
      queryKey: ["statsbystatus"],
      queryFn: shouldQuery ? async () => statsByStatus(from, session.token) : skipToken,
      staleTime: FIVE_MINUTES_IN_MILLISECONDS,
      ...options,
    });

  const getUptime = (uptimeType: UptimeType, options?: TQueryOptions) =>
    useQuery({
      queryKey: ["getuptime" + uptimeType],
      queryFn: shouldQuery ? async () => getUptimeRequest(uptimeType, session) : skipToken,
      refetchOnMount: true,
      staleTime: FIVE_MINUTES_IN_MILLISECONDS,
      ...options,
    });

  const getSearchSuggestions = ({ keyword, options }: GetSearchSuggestionsParams) =>
    useQuery({
      queryKey: ["getrequestsearchsugestions", keyword],
      queryFn: shouldQuery
        ? async (): Promise<[]> => getSearchSuggestionsRequest(keyword, session.token)
        : skipToken,
      ...options,
    });

  const getSLIs = ({ from, options }: GetSLIs) =>
    useQuery({
      queryKey: ["getslis", from],
      queryFn: shouldQuery
        ? async (): Promise<ServiceLevelIndicator> =>
            getServiceLevelIndicatorRequest(from, session.token)
        : skipToken,
      staleTime: FIVE_MINUTES_IN_MILLISECONDS,
      ...options,
    });

  const getUptimeSettings = (options?: TQueryOptions) =>
    useQuery({
      queryKey: ["getuptimesettings"],
      queryFn: shouldQuery
        ? async (): Promise<UptimeSetting[]> => getUptimeSettingsRequest(session.token)
        : skipToken,
      staleTime: FIVE_MINUTES_IN_MILLISECONDS,
      ...options,
    });

  const postUptimeSettings = (options?: TQueryOptions) => {
    return useMutation({
      mutationFn: async (uptimeSetting: UptimeSetting): Promise<MessageResponse> =>
        postUptimeSettingsRequest(uptimeSetting, session?.token ?? ""),
      onSuccess: () => {
        client.refetchQueries({ queryKey: ["getuptimesettings"] });
        client.invalidateQueries({ queryKey: ["getuptime"] });
      },
      ...options,
    });
  };

  const removeUptimeSettings = (options?: TQueryOptions) => {
    return useMutation({
      mutationFn: async (url: string): Promise<MessageResponse> =>
        removeUptimeSettingsRequest(url, session?.token ?? ""),
      onSuccess: () => {
        client.refetchQueries({ queryKey: ["getuptimesettings"] });
      },
      ...options,
    });
  };

  return {
    getStats,
    status,
    getRequests,
    getStatsByStatus,
    getUptime,
    getUptimeSettings,
    getSearchSuggestions,
    postUptimeSettings,
    removeUptimeSettings,
    getSLIs,
  };
};
