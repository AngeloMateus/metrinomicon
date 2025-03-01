import { Divider } from "@/components/shared/divider";
import { useApi } from "@/context/api/context";
import { UptimeEndpointListItem } from "./uptimeEndpointListItem";

export default function MonitoredEndpoints() {
  const { postUptimeSettings, getUptimeSettings } = useApi();
  postUptimeSettings();
  const { data: uptimeSettings } = getUptimeSettings();
  if (!uptimeSettings?.length) {
    return null;
  }

  return (
    <div className="flex flex-col pt-2 gap-3">
      <Divider color="light" />
      <h3 className="text-lg">Monitored endpoints</h3>
      <div className="flex flex-row pl-3">
        {Array.from(
          ["Service", "Interval", "Method", "Url"].map(i => (
            <h4 key={i} className={"w-28"}>
              {i}
            </h4>
          )),
        )}
      </div>
      <div className="flex flex-col items-start border rounded-lg p-3 gap-4">
        {uptimeSettings.map((setting, index) => (
          <UptimeEndpointListItem key={index} setting={setting} />
        ))}
      </div>
    </div>
  );
}
