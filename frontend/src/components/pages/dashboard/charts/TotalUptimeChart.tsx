import { Pie } from "@nivo/pie";

interface TotalUptimeChartProps {
  uptime: { total: number; url: string };
}

export function TotalUptimeChart({ uptime }: TotalUptimeChartProps) {
  const totalUptime = {
    id: "totaluptime",
    label: uptime.url,
    value: uptime.total,
    color: "rgba(255,255,255,255)",
  };
  const padded = {
    ...totalUptime,
    id: "padded",
    value: 100 - uptime.total,
    color: "rgba(255,255,255,255)",
  };
  return (
    <div className="flex relative justify-center w-56 pt-9">
      <div className="flex absolute self-center justify-center flex-col items-center">
        <h1 className="text-3xl">{uptime?.total.toFixed(0)}%</h1>
        <h3 className="">uptime</h3>
      </div>
      <Pie
        height={150}
        width={150}
        data={[totalUptime, padded]}
        colors={({ id }) => {
          if (id === "totaluptime") {
            return "hsl(151, 70%, 44%)";
          } else {
            return "rgba(255,255,255,0)";
          }
        }}
        innerRadius={0.78}
        padAngle={0.9}
        cornerRadius={12}
        enableArcLinkLabels={false}
        enableArcLabels={false}
        isInteractive={true}
        activeOuterRadiusOffset={0}
        animate={true}
        tooltip={point => {
          return (
            <div className="flex flex-row gap-2 bg-admin-bg-secondary-dark/90 rounded-lg p-1 shadow">
              <p>{point.datum.value.toFixed(2)}%</p>
            </div>
          );
        }}
      />
    </div>
  );
}
