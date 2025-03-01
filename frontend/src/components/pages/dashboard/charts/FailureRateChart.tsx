import { ResponsiveLine } from "@nivo/line";
import { format, parse } from "date-fns";
import { chartTheme } from "./util";

interface DataItem {
  date: string;
  failureRate: number;
  totalRequests: number;
}

export function FailureRateChart({ data: data }: { data: DataItem[] }) {
  if (data.filter(d => d.failureRate !== 0).length === 0) {
    return <p className="self-center">No requests yet</p>;
  }
  const formattedData = data.map(d => {
    return { x: d.date, y: d.failureRate * 100 };
  });
  const failureRate = { id: "Failure rate", color: "hsl(21, 100%, 40%)", data: formattedData };

  return (
    <ResponsiveLine
      data={[failureRate]}
      margin={{ top: 40, right: 60, bottom: 50, left: 60 }}
      lineWidth={0.8}
      enableSlices="x"
      enableGridX={false}
      enableCrosshair={false}
      isInteractive={true}
      colors={({ _id, data }) => (data["Failure rate"] = "hsl(21, 100%, 40%)")}
      gridYValues={[
        0,
        formattedData
          .map(d => d.y)
          .sort((a, b) => a - b)[0]
          .toFixed(0),
        formattedData
          .map(d => d.y)
          .sort((a, b) => a - b)
          [formattedData.length - 1].toFixed(0),
      ]}
      theme={chartTheme}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 20,
        legendOffset: 40,
        legendPosition: "middle",
        truncateTickAt: 0,
        tickValues: [formattedData[0].x, formattedData[formattedData.length - 1].x],
        format: function (value) {
          const parsed = parse(value, "dd-MM-yyyy HH:mm:ss.SSS", new Date());
          return format(parsed, "HH:mm dd/MM");
        },
      }}
      axisLeft={{
        tickValues: [
          0,
          formattedData
            .map(d => d.y)
            .sort((a, b) => a - b)[0]
            .toFixed(0),
          formattedData
            .map(d => d.y)
            .sort((a, b) => a - b)
            [formattedData.length - 1].toFixed(0),
        ],
        format: function (value) {
          return `${value}%`;
        },
      }}
      pointSize={0}
      pointColor={{ theme: "background" }}
      pointBorderWidth={0}
      pointBorderColor={{ from: "serieColor" }}
      pointLabel="data.yFormatted"
      pointLabelYOffset={-12}
      enableTouchCrosshair={true}
      useMesh={true}
    />
  );
}
