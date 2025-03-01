import { Pill } from "@/components/shared/pill";
import { SkeletonWrapper } from "@/components/shared/skeletonWrapper";
import { styles } from "@/components/styles";
import { formatResponseTime } from "@/components/util";
import { useApi } from "@/context/api/context";
import { formatPercentageTooltip, getPercentageSLIDifference } from "./util";

interface ServiceLevelIndicatorsProps {
  from: string;
}

export function ServiceLevelIndicators({ from }: ServiceLevelIndicatorsProps) {
  const { getSLIs } = useApi();
  const { data: slis, isLoading } = getSLIs({ from });

  const loading = isLoading || !slis;
  const { averageLatencyDeltaPercentage, errorRateDeltaPercentage, throughputDeltaPercentage } =
    getPercentageSLIDifference(
      slis ?? {
        averageLatency: 0,
        errorRate: 0,
        throughput: 0,
        prevAverageLatency: 0,
        prevErrorRate: 0,
        prevThroughput: 0,
      },
    );

  const deltaPercentages = [
    {
      percentage: averageLatencyDeltaPercentage,
      label: "Average Latency",
      value: `${formatResponseTime(slis?.averageLatency ?? 0)}`,
      reverseColor: true,
    },
    {
      percentage: errorRateDeltaPercentage,
      label: "Error Rate",
      value: `${((slis?.errorRate ?? 0) * 100).toFixed(2)}%`,
      reverseColor: true,
    },
    {
      percentage: throughputDeltaPercentage,
      label: "Throughput",
      value: `${slis?.throughput?.toFixed(2)} req/s`,
      reverseColor: false,
    },
  ];

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-7 ">
      <>
        {deltaPercentages.map(({ percentage, label, reverseColor, value }, index) => {
          const percentageString =
            percentage === 0 ? undefined : `${Math.abs(percentage).toFixed(2)} %`;
          return (
            <div key={index + label} className={`${styles.card} gap-4 justify-between p-6 h-32`}>
              <div className="flex basis-9 flex-grow-1 flex-col gap-6 justify-center  text-nowrap">
                <SkeletonWrapper isLoading={loading} size={"small"} extraClasses="w-24">
                  <p>{label}</p>
                </SkeletonWrapper>
                <SkeletonWrapper
                  isLoading={loading}
                  size={"medium"}
                  extraClasses="w-14 h-[1.5rem] my-1">
                  <p className="text-2xl">{value}</p>
                </SkeletonWrapper>
              </div>
              <div className="flex flex-col justify-start items-center h-full">
                <Pill
                  label={percentageString}
                  type={(() => {
                    switch (true) {
                      case reverseColor && percentage > 0:
                        return "error";
                      case reverseColor && percentage < 0:
                        return "success";
                      case percentage > 0:
                        return "success";
                      case percentage < 0:
                        return "error";
                      default:
                        return "info";
                    }
                  })()}
                  icon={(() => {
                    switch (true) {
                      case percentage > 0:
                        return "up";
                      case percentage < 0:
                        return "down";
                      default:
                        return "minus";
                    }
                  })()}
                />
                <p className="text-[11px] text-gray-300">vs {formatPercentageTooltip(from)}</p>
              </div>
            </div>
          );
        })}
      </>
    </div>
  );
}
