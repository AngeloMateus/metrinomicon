import { useApi } from "@/context/api/context";
import { UptimeType } from "@/enums/uptime";
import { useRouter } from "next/navigation";
import { styles } from "../../styles";
import { TimeRangeChart } from "./charts/TimeRangeChart";
import { TotalUptimeChart } from "./charts/TotalUptimeChart";

export function ReliabilityWidget() {
  const router = useRouter();
  const { getUptime, getUptimeSettings } = useApi();
  const { data: uptimeSettings, isFetching: isFetchingSettings } = getUptimeSettings();
  const { data: uptimeData, isFetching: isFetchingUptimeData } = getUptime(UptimeType.TOTAL, {
    staleTime: 60 * 1000 * 5,
  });
  const { data: hourlyUptime, isFetching: isFetchingHourlyUptime } = getUptime(UptimeType.PER_HOUR);

  if (!uptimeSettings?.length || !hourlyUptime?.length || !uptimeData?.length) {
    return (
      <div className={`${styles.card} h-32 justify-center items-center mt-3`}>
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="text-md font-bold underline">
          Set up an endpoint
        </button>
      </div>
    );
  }

  if (isFetchingHourlyUptime || isFetchingUptimeData || isFetchingSettings) {
    return null;
  }

  const hourlyUptimeByUrl = hourlyUptime.reduce(
    (acc, item) => {
      if (!acc[item.url]) {
        acc[item.url] = [];
      }
      acc[item.url].push(item);
      return acc;
    },
    {} as Record<string, UptimeResponse[]>,
  );

  return (
    <div
      className={`${styles.card} flex flex-col justify-center items-center my-3 w-full relative`}>
      {Object.entries(hourlyUptimeByUrl).map((data, index) => {
        const url = data[0];
        const items = data[1];
        const uptime = uptimeData.find(i => i.url === url);
        return (
          <div key={index + url} className="flex flex-col w-full">
            <p className="text-sm self-start pt-4 pl-4 absolute">
              {uptimeSettings.find(setting => setting.url === url)?.name}
            </p>
            <div className="flex md:grid-cols-1 lg:grid-cols-2 items-start justify-center">
              <TotalUptimeChart uptime={{ total: uptime?.uptime ?? 0, url: uptime?.url ?? "" }} />
              <TimeRangeChart data={items} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
