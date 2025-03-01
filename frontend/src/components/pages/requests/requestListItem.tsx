import { Skeleton } from "@/components/shared/skeleton";
import { Popover, PopoverBackdrop, PopoverButton, PopoverPanel } from "@headlessui/react";
import { isEmpty } from "lodash";
import { formatResponseTime, getStatusColor, parsePathName, PrettyPrintJson } from "../../util";

export interface RequestListItemProps {
  setSelectedIndex: (index: number | null) => void;
  index: number;
  log: Request;
  selectedIndex: number | null;
}

export function RequestListItem({
  setSelectedIndex,
  index,
  log,
  selectedIndex,
}: RequestListItemProps) {
  const url = parsePathName(log.endpoint);
  return (
    <Popover className="flex flex-col ">
      <PopoverButton
        onClick={() => {
          if (isEmpty(document.getSelection()?.toString())) {
            setSelectedIndex(selectedIndex === index ? null : index);
          }
        }}
        type="button"
        key={index + log.date}
        className={`flex items-start pt-3 pb-1 border-t-[0.5px] border-admin-light/50 hover:bg-slate-600/30 text-start select-text outline-none`}>
        <div className="flex flex-1 pr-2 sm:w-40 text-sm flex-row gap-6 justify-between lg:break-all">
          <div className="flex flex-row ">
            <p className="w-[170px] min-w-[170px] font-mono text-[13px]">
              {log.date.substring(0, 19)}
            </p>
            <p className="text-sm pb-2 ">{`${url}`}</p>
          </div>
          <div className="flex flex-row gap-4 items-center justify-evenly">
            <div
              className={`flex justify-end w-20 mb-1 font-mono`}>{`${formatResponseTime(log.res_time)}`}</div>
            <div className="flex w-16 justify-center  mb-1">{log.method}</div>
            <div
              className={`${getStatusColor(log.status)} w-7 flex mb-1 font-mono justify-end font-light`}>
              {log.status}
            </div>
          </div>
        </div>
      </PopoverButton>
      <PopoverBackdrop className="fixed inset-0 bg-black/25" />
      <PopoverPanel
        transition
        className={`absolute top-0 right-0 h-full w-3/4 lg:w-2/5 bg-admin-bg-secondary-dark flex-col transition duration-100 ease-out data-[closed]:opacity-0 data-[closed]:translate-x-5 p-5 shadow-xl justify-center items-center overflow-y-auto border-l-[0.5px] border-admin-text-light`}>
        <div className="flex flex-row justify-between">
          <h3 className="pb-1">Request:</h3>
          <div className="flex flex-row gap-4">
            <p>{formatResponseTime(log.res_time)}</p>
            <p>{log.method}</p>
            <p className={getStatusColor(log.status)}>{log.status}</p>
          </div>
        </div>
        <div className="flex h-fit flex-1 flex-col mt-2 p-3 border-[0.5px] border-admin-text-light rounded-md gap-3 bg-admin-bg-dark">
          <div className="flex flex-row gap-2">
            <p className="text-sm text-orange-100">URL:</p>
            <p className="text-sm">{log.endpoint}</p>
          </div>
          {log.params && (
            <div className="flex flex-row gap-2">
              <p className="text-sm text-orange-100">Parameters:</p>
              <p className="text-sm break-all">{log.params}</p>
            </div>
          )}
        </div>
        <p className="pt-3">Request headers:</p>
        <div className="h-fit flex-1 mt-3 p-3 border-[0.5px] border-admin-text-light bg-admin-bg-dark rounded-md">
          {log.req_headers
            .split("\n")
            .sort()
            .map((headers, i) => (
              <div key={i + log.date} className={`flex flex-row text-sm`}>
                {headers
                  .split(":")
                  .map((header, index, all) =>
                    index === 0 ? (
                      <div
                        key={header + index}
                        className={`min-w-[160px] text-sm text-orange-100 pb-1 text-right pe-[20px]`}>{`${header}:`}</div>
                    ) : (
                      <div
                        key={header + index}
                        className={`break-all text-sm max-w-fit pb-1`}>{`${header}${index < all.length - 1 ? ":" : ""}`}</div>
                    ),
                  )}
              </div>
            ))}
        </div>
        {!!log.req_body && (
          <>
            <h3 className="text-md pt-3">Request body:</h3>
            <div className="h-fit flex-1 mt-2 p-3 border-[0.5px] border-admin-text-light bg-admin-bg-dark rounded-md">
              <PrettyPrintJson data={log.req_body} />
            </div>
          </>
        )}
        <p className="pt-3">Response headers:</p>
        <div className="h-fit flex-1 mt-2 p-3 border-[0.5px] border-admin-text-light bg-admin-bg-dark rounded-md">
          {log.res_headers
            .split("\n")
            .sort()
            .map((headers, i) => (
              <div key={i + log.date} className={`flex flex-row text-sm`}>
                {headers
                  .split(":")
                  .map((header, index, all) =>
                    index === 0 ? (
                      <div
                        key={header + index}
                        className={`min-w-[160px] text-sm text-orange-100 pb-1 text-right pe-[20px]`}>{`${header}:`}</div>
                    ) : (
                      <div
                        key={header + index}
                        className={`break-all text-sm max-w-xl pb-1`}>{`${header}${index < all.length - 1 ? ":" : ""}`}</div>
                    ),
                  )}
              </div>
            ))}
        </div>
        {!!log.res_body && (
          <>
            <h3 className="text-md pt-3">Response body:</h3>
            <div className="h-fit flex-1 mt-2 p-3 border-[0.5px] border-admin-text-light rounded-md bg-admin-bg-dark">
              <PrettyPrintJson data={log.res_body} />
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}

export function RequestListItemSkeleton({ id }: { id: number }) {
  return (
    <div className="flex border-t-[0.5px] border-admin-light/50 flex-row gap-3 py-[5px]">
      <Skeleton size="small" extraClasses="w-[155px] my-2 h-[18px]" />
      {id % 2 ? (
        <Skeleton size="small" extraClasses="w-[180px] my-2 h-[18px]" />
      ) : (
        <Skeleton size="small" extraClasses="w-[220px] my-2 h-[18px]" />
      )}
      <div className="flex w-full h-full flex-1 justify-end">
        <Skeleton size="small" extraClasses="w-[180px] my-2 h-[18px]" />
      </div>
    </div>
  );
}
