import { getApiBase } from "@/components/util";
import { UserDataInterface } from "../session";

export async function getStatsRequest(from: string, token: string) {
  try {
    const response = await fetch(
      `${getApiBase()}/requests-stats?statType=status&from=${from}&granularity=hourly`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": token,
        },
      },
    );
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function getRequestsRequest(
  {
    currentItem,
    search,
    method,
    from,
    itemsPerPage,
    status,
    resTimeGT,
    resTimeLT,
    to,
  }: RequestsParams,
  token: string,
) {
  try {
    const response = await fetch(
      `${getApiBase()}/requests?from=${from}&to=${to}&index=${currentItem}` +
        `&limit=${itemsPerPage}&method=${method ?? ""}&search=${search ?? ""}` +
        `&status=${status ?? ""}&resTimeLT=${resTimeLT ?? ""}&resTimeGT=${resTimeGT ?? ""}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": token,
        },
      },
    );
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function statsByStatus(from: string, token: string) {
  try {
    const response = await fetch(`${getApiBase()}/requests-by-status?from=${from}`, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": token,
      },
    });
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function getUptimeRequest(uptimeType: string, session: UserDataInterface) {
  try {
    const response = await fetch(`${getApiBase()}/uptime?uptimeType=${uptimeType}`, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": session?.token,
      },
    });
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function getUptimeSettingsRequest(token: string) {
  try {
    const response = await fetch(`${getApiBase()}/uptime-settings`, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": token,
      },
    });
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function getSearchSuggestionsRequest(keyword: string, token: string) {
  try {
    const response = await fetch(`${getApiBase()}/requests/search/suggestions?keyword=${keyword}`, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": token,
      },
    });
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function postUptimeSettingsRequest(uptimeSetting: UptimeSetting, token: string) {
  try {
    const response = await fetch(`${getApiBase()}/uptime-settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": token,
      },
      body: JSON.stringify(uptimeSetting),
    });
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function removeUptimeSettingsRequest(url: string, token: string) {
  try {
    const response = await fetch(`${getApiBase()}/uptime-settings?url=${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": token,
      },
    });
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function getServiceLevelIndicatorRequest(from: string, token: string) {
  try {
    const response = await fetch(`${getApiBase()}/requests/sli?from=${from}`, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": token,
      },
    });
    return response.json();
  } catch (error) {
    console.error(error);
  }
}
