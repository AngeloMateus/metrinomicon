export function getPercentageSLIDifference(slis: ServiceLevelIndicator): {
  averageLatencyDeltaPercentage: number;
  errorRateDeltaPercentage: number;
  throughputDeltaPercentage: number;
} {
  const {
    averageLatency,
    errorRate,
    throughput,
    prevErrorRate,
    prevThroughput,
    prevAverageLatency,
  } = slis;

  const averageLatencyDeltaPercentage = calculatePercentageDelta(
    averageLatency,
    prevAverageLatency,
  );
  const errorRateDeltaPercentage = calculatePercentageDelta(errorRate, prevErrorRate);
  const throughputDeltaPercentage = calculatePercentageDelta(throughput, prevThroughput);

  return {
    averageLatencyDeltaPercentage,
    errorRateDeltaPercentage,
    throughputDeltaPercentage,
  };
}

function calculatePercentageDelta(currentValue: number, previousValue: number): number {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100.0;
}

export function formatPercentageTooltip(date: string) {
  const now = new Date();
  const dateObj = new Date(date);
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

  let formattedDate;
  if (diffHours < 24) {
    formattedDate = "last hour";
  } else if (diffHours < 48) {
    formattedDate = "yesterday";
  } else if (diffHours < 72) {
    formattedDate = "2 days ago";
  } else {
    formattedDate = "last week";
  }

  return formattedDate;
}
