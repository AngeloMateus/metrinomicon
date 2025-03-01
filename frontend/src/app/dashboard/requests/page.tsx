"use client";

import { requestsAtom, requestsSearchValueAtom } from "@/atoms/requests";
import { CalendarModal } from "@/components/pages/requests/calendarModal";
import { FilterList } from "@/components/pages/requests/filterList";
import { RequestsFilters } from "@/components/pages/requests/filters";
import { Pagination } from "@/components/pages/requests/pagination";
import {
  RequestListItem,
  RequestListItemSkeleton,
} from "@/components/pages/requests/requestListItem";
import { useLogsSocket } from "@/components/pages/useLogsSocket";
import ButtonGroup from "@/components/shared/buttonGroup";
import EmptyCase from "@/components/shared/emptyCase";
import { useApi } from "@/context/api/context";
import { QueryRequestMethod } from "@/enums/api";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { BiRefresh } from "react-icons/bi";

enum LogType {
  FULL,
  STREAM,
}

export default function Requests() {
  const requestsSearchValue = useAtomValue(requestsSearchValueAtom);
  const [requests, setRequests] = useAtom(requestsAtom);
  const [logType, setLogType] = useState(LogType.FULL);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { streamLogs } = useLogsSocket(logType === LogType.STREAM);
  const { getRequests } = useApi();
  const {
    data: requestsData,
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
  } = getRequests(
    {
      from: requests.timeRangeFrom,
      to: requests.timeRangeTo,
      currentItem: requests?.currentItem ?? 0,
      itemsPerPage: requests?.itemsPerPage || 15,
      method: requests.method ?? QueryRequestMethod.ALL,
      status: requests.status,
      search: requestsSearchValue,
      resTimeGT: requests.resTimeGT,
      resTimeLT: requests.resTimeLT,
    },
    { enabled: false },
  );

  const loading = isLoadingRequests;

  useEffect(() => {
    setRequests(prev => ({ ...prev, ...requestsData }));
  }, [requestsData?.requests, isLoadingRequests]);

  useEffect(() => {
    if (!requests.timeRangeFrom || !requests.timeRangeTo) return;
    refetchRequests();
  }, [
    requests?.currentItem,
    requestsSearchValue,
    requests.method,
    requests.status,
    requests.resTimeLT,
    requests.resTimeGT,
    requests.timeRangeFrom,
    requests.timeRangeTo,
  ]);

  const displayedRequests = logType === LogType.FULL ? requests?.requests : streamLogs;

  const displayPagination = logType === LogType.FULL;

  const paginationComponent = (
    <Pagination
      onChange={() => {
        setSelectedIndex(null);
      }}
    />
  );

  return (
    <div id="main-panel" className="flex flex-1 justify-start max-w-full items-start p-7 h-full">
      <div className="flex w-full flex-col items-start justify-start h-full">
        <div className="flex flex-row pb-4 self-end">
          <ButtonGroup
            buttons={[{ label: "Full" }, { label: "Stream" }]}
            onChange={index => {
              setLogType(index === 0 ? LogType.FULL : LogType.STREAM);
            }}
            initialIndex={0}
            display={{ borderColor: "border-bg-dark" }}
          />
        </div>
        <h1 className="self-start text-lg pb-3">Requests</h1>
        <div className="flex-col w-full">
          {logType === LogType.FULL && (
            <div className="flex flex-1 items-center pb-5 justify-between">
              <div className="flex flex-row items-center">
                <>
                  <ButtonGroup
                    buttons={[
                      { icon: "calendar" },
                      { label: "Past month" },
                      { label: "Past week" },
                      { label: "Today" },
                    ]}
                    initialIndex={3}
                    display={{
                      borderColor: "border-admin-bg-secondary-dark",
                      buttonClassName: "py-1",
                    }}
                    onChange={index => {
                      if (index === 0) {
                        return setIsCalendarVisible(true);
                      }

                      const date = new Date();
                      let dateString: string;
                      switch (index) {
                        case 1:
                          date.setMonth(date.getMonth() - 1);
                          dateString = date.toISOString();
                          break;
                        case 2:
                          date.setDate(date.getDate() - 7);
                          dateString = date.toISOString();
                          break;
                        case 3:
                          date.setDate(date.getDate() - 1);
                          dateString = date.toISOString();
                          break;
                      }
                      setRequests(prev => ({
                        ...prev,
                        currentItem: 0,
                        timeRangeFrom: dateString,
                        timeRangeTo: new Date().toISOString(),
                      }));
                    }}
                  />
                  <CalendarModal
                    isVisible={isCalendarVisible}
                    onSubmit={({ fromDate, toDate }) => {
                      setIsCalendarVisible(false);
                      setRequests(prev => ({
                        ...prev,
                        currentItem: 0,
                        timeRangeFrom: fromDate.toISOString(),
                        timeRangeTo: toDate.toISOString(),
                      }));
                    }}
                    onCancel={() => {
                      setIsCalendarVisible(false);
                    }}
                  />
                  <div className="flex flex-row items-center justify-center">
                    <RequestsFilters />
                    <button
                      onClick={() => refetchRequests()}
                      disabled={loading}
                      className={`px-3 ${loading ? "animate-spin" : ""}`}>
                      <BiRefresh size={22} />
                    </button>
                  </div>
                </>
                <FilterList />
              </div>
              <div className="">
                {displayPagination && (
                  <div className="flex justify-end pl-4">{paginationComponent}</div>
                )}
              </div>
            </div>
          )}
          {!loading && !displayedRequests?.length && (
            <div className="flex items-center flex-col pt-24">
              <EmptyCase
                size={190}
                label={
                  logType === LogType.FULL
                    ? "Nothing to display for this timeframe"
                    : "Waiting for requests"
                }
                imagePath={logType === LogType.FULL ? "/empty2.svg" : "/empty3.svg"}
              />
            </div>
          )}
          {loading &&
            !displayedRequests?.length &&
            logType === LogType.FULL &&
            Array.from({ length: 15 }, (_, index) => (
              <RequestListItemSkeleton key={index} id={index} />
            ))}
          {!!displayedRequests?.length && (
            <>
              <div className="flex flex-col">
                {!!displayedRequests?.length &&
                  displayedRequests?.map((log, index) => (
                    <RequestListItem
                      key={index + log.date}
                      log={log}
                      index={index}
                      setSelectedIndex={setSelectedIndex}
                      selectedIndex={selectedIndex}
                    />
                  ))}
              </div>
              <div className="border-b-[0.5px] border-admin-light/50" />
              {displayPagination && (requests?.itemsPerPage ?? 0) > 15 && (
                <div className="flex justify-end mt-4 mb-4">{paginationComponent}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
