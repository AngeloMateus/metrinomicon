import { Theme } from "@nivo/core";
interface DailyUptime {
  date: string;
  uptime: number;
}

export function calculateDailyUptime(data: UptimeResponse[]): DailyUptime[] {
  // Step 1: Group by day
  const dailyData: { [key: string]: number[] } = {};

  data.forEach(entry => {
    const date = entry.hour!.split(" ")[0]; // Extract date (YYYY-MM-DD)
    if (!dailyData[date]) {
      dailyData[date] = [];
    }
    dailyData[date].push(entry.uptime);
  });

  // Step 2: Calculate daily uptime (average)
  const dailyUptime: DailyUptime[] = [];
  for (const date in dailyData) {
    const uptimes = dailyData[date];
    const avgUptime = uptimes.reduce((sum, uptime) => sum + uptime, 0) / uptimes.length;
    dailyUptime.push({ date, uptime: avgUptime });
  }

  dailyUptime.sort((a, b) => a.date.localeCompare(b.date));

  return dailyUptime;
}

export const chartTheme = {
  legends: {
    text: {
      fill: "#fff",
    },
    title: {
      text: {
        fill: "#fff",
      },
    },
    ticks: {
      text: {
        fill: "#fff",
      },
    },
  },
  tooltip: {
    container: {
      color: "#000",
    },
  },
  labels: {
    text: {
      fill: "#fff",
    },
  },
  axis: {
    legend: {
      text: {
        fill: "#fff",
      },
    },
    ticks: {
      line: {
        visibility: "hidden",
        stroke: "#fff",
      },
      text: {
        fill: "#fff",
      },
    },
  },
} as Partial<Theme>;
