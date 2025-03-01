import { TimeRange } from "@nivo/calendar";
import { calculateDailyUptime, chartTheme } from "./util";

export function TimeRangeChart({ data: data = [] }: { data?: UptimeResponse[] }) {
  if (data.length === 0) {
    return null;
  }

  const dailyUptime = calculateDailyUptime(data).map(d => ({
    day: d.date,
    value: parseFloat(d.uptime.toFixed(2)),
  }));

  return (
    <div className="place-self-center">
      <TimeRange
        height={200}
        width={650}
        data={dailyUptime}
        margin={{ top: 35, right: 0, bottom: 0, left: 28 }}
        from={
          new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 - 3, 1)
            .toISOString()
            .split("T")[0]
        }
        to={
          new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0)
            .toISOString()
            .split("T")[0]
        }
        emptyColor="#5a5a5a"
        dayRadius={4}
        daySpacing={4}
        colors={["#f47560", "#e8c1a0", "#97e3d5", "#61cdbb"]}
        align="center"
        tooltip={point => {
          return (
            <div className="flex flex-row gap-2 bg-admin-bg-secondary-dark/70 rounded-lg p-1 shadow">
              <p>{point.day}</p>
              <p>{point.value}%</p>
            </div>
          );
        }}
        minValue={0}
        maxValue={100}
        dayBorderWidth={0}
        theme={chartTheme}
      />
    </div>
  );
}
