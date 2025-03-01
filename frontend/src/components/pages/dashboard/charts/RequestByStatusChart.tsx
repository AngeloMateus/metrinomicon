import EmptyCase from "@/components/shared/emptyCase";
import { ResponsiveBar } from "@nivo/bar";
import { keys, reduce, uniq, uniqBy, values } from "lodash";
import { chartTheme } from "./util";

export function RequestsByStatusChart({ data: data = [] }: { data: RequestsByStatus[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-full justify-center items-center self-center gap-4">
        <EmptyCase label="Not enough data" imagePath={"/empty1.svg"} />
      </div>
    );
  }

  const formattedData = uniqBy(
    data
      .map(d => {
        const urlByStatus = data.filter(item => item.endpoint === d.endpoint);
        const result = reduce(
          urlByStatus,
          function (acc, curr) {
            return {
              ...acc,
              [curr.status]: curr.request_count,
              endpoint: curr.endpoint,
            };
          },
          {},
        );
        return result;
      })
      .sort()
      .reverse(),
    "endpoint",
  );
  const highestValue = Math.max(
    ...formattedData.map(i => values(i).filter(j => typeof j === "number")).flat(),
  );

  return (
    <ResponsiveBar
      data={formattedData}
      keys={uniq(formattedData.map(obj => keys(obj).filter(key => key !== "endpoint")).flat())}
      indexBy="endpoint"
      layout="horizontal"
      enableGridY={false}
      groupMode="grouped"
      margin={{ top: 30, right: 80, bottom: 50, left: 120 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      borderRadius={1}
      colors={({ id, hidden }) => {
        if (hidden) {
          return "hsl(11, 77%, 52%)";
        }
        switch (id) {
          case "500":
            return "hsl(11, 77%, 52%)";
          case "401":
            return "hsl(300, 20%, 46%)";
          case "404":
            return "hsl(49, 52%, 57%)";
          case "400":
            return "hsl(26, 62%, 52%)";
          case "200":
            return "hsl(151, 48%, 44%)";
          case "101":
            return "hsl(211, 82%, 56%)";
          default:
            return "hsl(0, 0%, 80%)"; // default color if status doesn't match
        }
      }}
      theme={chartTheme}
      axisTop={null}
      axisRight={null}
      axisLeft={{
        tickSize: 0,
        tickPadding: 8,
        tickRotation: -32,
        format: value => (value.length > 19 ? `...${value.substring(value.length - 19)}` : value),
      }}
      axisBottom={{
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        truncateTickAt: 0,
        tickValues: [0, highestValue],
      }}
      label={"Label"}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "top-right",
          direction: "column",
          justify: false,
          translateX: 120,
          translateY: 10,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 22,
          itemDirection: "left-to-right",
          itemOpacity: 1.0,
          symbolSize: 20,
          toggleSerie: true,
          effects: [
            {
              on: "hover",
              style: {
                itemOpacity: 0.85,
              },
            },
          ],
        },
      ]}
    />
  );
}
