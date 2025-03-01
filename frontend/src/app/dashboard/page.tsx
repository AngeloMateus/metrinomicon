"use client";

import { dashboardAtom } from "@/atoms/dashboard";
import { FailureRateChart } from "@/components/pages/dashboard/charts/FailureRateChart";
import { RequestsByStatusChart } from "@/components/pages/dashboard/charts/RequestByStatusChart";
import { TotalRequestsChart } from "@/components/pages/dashboard/charts/TotalRequestsChart";
import { ReliabilityWidget } from "@/components/pages/dashboard/reliability";
import { ServiceLevelIndicators } from "@/components/pages/dashboard/serviceLevelIndicators";
import ButtonGroup from "@/components/shared/buttonGroup";
import { Spinner } from "@/components/shared/spinner";
import { styles } from "@/components/styles";
import { useApi } from "@/context/api/context";
import { sub, subDays } from "date-fns";
import { useAtom } from "jotai";
import { isEmpty } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { BiRefresh } from "react-icons/bi";

export default function Dashboard() {
  const [dashboard, setDashboard] = useAtom(dashboardAtom);
  const [fromDate, setFromDate] = useState(subDays(new Date(), 1).toISOString());

  const { getStats, getStatsByStatus, getSLIs } = useApi();
  const { refetch: refetchSLIs } = getSLIs({ from: fromDate });
  const {
    data: statsByStatus,
    isFetching: isFetchingStatsbyStatus,
    refetch: refetchStatsByStatus,
  } = getStatsByStatus(fromDate);
  const {
    data: chartData,
    isFetching: isFetchingStats,
    refetch: refetchStats,
  } = getStats(fromDate);

  useEffect(() => {
    refetchStats();
    refetchStatsByStatus();
  }, [fromDate]);

  useMemo(() => {
    let newFromDate;
    switch (dashboard.timeframeFrom) {
      case 0:
        newFromDate = subDays(new Date(), 7).toISOString();
        break;
      case 1:
        newFromDate = subDays(new Date(), 2).toISOString();
        break;
      case 2:
        newFromDate = subDays(new Date(), 1).toISOString();
        break;
      default:
        newFromDate = sub(new Date(), { hours: 1 }).toISOString();
        break;
    }
    setFromDate(newFromDate);
  }, [dashboard.timeframeFrom]);

  const isLoading = isFetchingStats || isFetchingStatsbyStatus || isEmpty(chartData) || !chartData;

  return (
    <div className={"flex w-full justify-center"}>
      <div className="grid flex-col p-7 w-full max-w-screen-xl">
        <div className="flex flex-row">
          <ButtonGroup
            buttons={[{ label: "1w" }, { label: "2d" }, { label: "24h" }, { label: "1h" }]}
            onChange={value => setDashboard({ ...dashboard, timeframeFrom: value })}
            initialIndex={3}
          />
          <div className="flex flex-row pl-3">
            <button
              onClick={() => {
                refetchStats();
                refetchStatsByStatus();
                refetchSLIs();
              }}
              className={`"border-gray-700"`}>
              <BiRefresh size={20} className="hover:text-gray-200 active:text-gray-500" />
            </button>
          </div>
        </div>
        <ServiceLevelIndicators from={fromDate} />
        <div className="grid grid-cols-1 lg:grid-cols-2 pt-6 gap-6">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 flex-col gap-6">
            <div>
              <h3 className="text-md font-bold">Error rate</h3>
              <div className={`${styles.card} justify-center mt-3 h-[200px] w-full `}>
                {isLoading ? <Spinner /> : <FailureRateChart data={chartData} />}
              </div>
            </div>
            <div>
              <h3 className="text-md font-bold">Throughput</h3>
              <div className={`${styles.card} justify-center mt-3 h-[200px] w-full`}>
                {isLoading ? <Spinner /> : <TotalRequestsChart data={chartData} />}
              </div>
            </div>
          </div>
          <div className="flex-col">
            <h3 className="text-md font-bold">Top 3 most called by status</h3>
            <div className={`${styles.card} justify-center mt-3 h-[460px] w-full`}>
              {isFetchingStatsbyStatus ? (
                <Spinner />
              ) : (
                <RequestsByStatusChart data={statsByStatus ?? []} />
              )}
            </div>
          </div>
        </div>
        <div className="flex-col my-6">
          <h3 className="text-md font-bold">Reliability</h3>
          <ReliabilityWidget />
        </div>
        <div className="h-3" />
      </div>
    </div>
  );
}
