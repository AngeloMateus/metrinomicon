import { ResponsiveLine } from "@nivo/line";
import { format } from "date-fns";
import { parse } from "date-fns/parse";
import { chartTheme } from "./util";

interface DataItem {
  date: string;
  failureRate: number;
  totalRequests: number;
}

export function TotalRequestsChart({ data: data = [] }: { data: DataItem[] }) {
  if (data.filter(d => d.totalRequests !== 0).length === 0) {
    return <p className="self-center">No requests yet</p>;
  }
  const formattedData = data.map(d => {
    return { x: d.date, y: d.totalRequests };
  });
  const totalRequests = { id: "Total Requests", color: "hsl(21, 100%, 40%)", data: formattedData };

  return (
    <ResponsiveLine
      data={[totalRequests]}
      margin={{ top: 40, right: 60, bottom: 50, left: 60 }}
      lineWidth={0.8}
      enableGridX={false}
      enableCrosshair={false}
      enableSlices="x"
      gridYValues={[
        0,
        formattedData.map(d => d.y).sort((a, b) => a - b)[0],
        formattedData.map(d => d.y).sort((a, b) => a - b)[formattedData.length - 1],
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
          formattedData.map(d => d.y).sort((a, b) => a - b)[0],
          formattedData.map(d => d.y).sort((a, b) => a - b)[formattedData.length - 1],
        ],
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
