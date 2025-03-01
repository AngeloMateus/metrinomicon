import { requestsAtom, requestsSearchValueAtom } from "@/atoms/requests";
import { Button } from "@/components/shared/buttons/button";
import { IconButton } from "@/components/shared/buttons/iconButton";
import { Dropdown } from "@/components/shared/dropdown";
import { parsePathName } from "@/components/util";
import { useApi } from "@/context/api/context";
import { QueryRequestMethod } from "@/enums/api";
import { ResponseTimeFilter } from "@/enums/requests";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Input,
} from "@headlessui/react";
import { useAtom } from "jotai";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { VscClose } from "react-icons/vsc";

export function RequestsFilters() {
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState<string>();
  const [method, setMethod] = useState<QueryRequestMethod>(QueryRequestMethod.ALL);
  const [responseTimeFilter, setResponseTimeFilter] = useState<ResponseTimeFilter>(
    ResponseTimeFilter.GREATER_THAN,
  );
  const [responseTimeValue, setResponseTimeValue] = useState<string>("");
  const [requestsSearchValue, setRequestsSearchValueAtom] = useAtom(requestsSearchValueAtom);
  const [requests, setRequests] = useAtom(requestsAtom);
  const { getSearchSuggestions } = useApi();
  const { data: searchSuggestions, refetch: refetchSearchSuggestions } = getSearchSuggestions({
    keyword: searchValue ?? "",
    options: {
      enabled: false,
    },
  });

  useEffect(() => {
    if (!isFiltersDialogOpen) return;
    setSearchValue(requestsSearchValue ?? "");
    setStatusValue(requests.status ?? "");
    setMethod(requests.method ?? QueryRequestMethod.ALL);
    setResponseTimeValue(requests.resTimeLT || requests.resTimeGT || "");
    setResponseTimeFilter(
      requests.resTimeGT ? ResponseTimeFilter.GREATER_THAN : ResponseTimeFilter.LESS_THAN,
    );
  }, [isFiltersDialogOpen]);

  const debouncedRefetchSearchSuggestions = useRef(debounce(refetchSearchSuggestions, 350));

  return (
    <>
      <IconButton
        label="Filter"
        icon="filter"
        onClick={() => setIsFiltersDialogOpen(true)}
        display={{
          size: "sm",
          className: "ms-3 px-3 py-[1px] border-none rounded-md",
        }}
      />
      <Dialog
        open={isFiltersDialogOpen}
        onClose={() => setIsFiltersDialogOpen(false)}
        transition
        className="fixed flex w-screen items-center  justify-center bg-black/50 transition duration-100 ease-out data-[closed]:opacity-0 ">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/20 duration-100 ease-out data-[closed]:opacity-0 "
        />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4 text-sm">
          <DialogPanel
            transition
            className="space-y-4 border-[0.5px] rounded-lg shadow-lg bg-admin-bg-secondary-dark p-6 transition duration-75 ease-out data-[closed]:translate-y-2">
            <DialogTitle className={"text-center"}>Filter Requests</DialogTitle>
            <div className="flex flex-row items-start gap-6 pb-4 ">
              <div className="flex items-center justify-start relative pe-5">
                <div className="flex flex-row items-start gap-6 pb-4">
                  <div className="flex flex-col items-start">
                    <p className="flex h-12 w-24 items-center">Url</p>
                    <p className="flex h-12 w-24 items-center">Method</p>
                    <p className="flex h-12 w-24 items-center">Status</p>
                    <p className="flex h-12 w-24 items-center">Response time</p>
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="flex h-12 items-center">
                      <Combobox value={searchValue}>
                        <ComboboxInput
                          autoComplete="off"
                          aria-label="Search"
                          placeholder="Search url"
                          className="border-[0.5px] rounded-md px-2 p-1 text-gray-900 w-72 text-sm pr-6"
                          value={searchValue ?? ""}
                          onChange={({ target }) => {
                            setSearchValue(target.value);
                            debouncedRefetchSearchSuggestions.current();
                          }}
                        />
                        {!!searchValue?.length && (
                          <button
                            className="absolute right-[25px]"
                            onClick={() => {
                              setSearchValue("");
                            }}>
                            <VscClose size={20} className="text-admin-bg-secondary-dark" />
                          </button>
                        )}
                        <ComboboxOptions
                          anchor="bottom"
                          transition={true}
                          className="origin-top border bg-white empty:invisible rounded-md mt-2 transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 z-10">
                          {searchSuggestions?.map(suggestion => {
                            const pathName = parsePathName(suggestion);
                            return (
                              <ComboboxOption
                                key={suggestion}
                                value={suggestion}
                                className="group flex p-1 m-[3px] rounded-sm gap-2 bg-white data-[focus]:bg-blue-100/30 w-[var(--input-width)]">
                                <button
                                  onClick={() => {
                                    setSearchValue(suggestion);
                                  }}
                                  className="text-gray-900 text-sm w-full text-left">
                                  {pathName}
                                </button>
                              </ComboboxOption>
                            );
                          })}
                        </ComboboxOptions>
                      </Combobox>
                    </div>
                    <div className="flex h-12 items-center">
                      <Dropdown
                        label={method}
                        display={{
                          className:
                            "flex text-xs text-justify tracking-widest hover:bg-slate-600 rounded-md p-[6px] border-[0.5px] border-gray-300 w-20 justify-center",
                        }}
                        options={Array.from(
                          Object.values(QueryRequestMethod).map(i => ({
                            label: i,
                            onPress: () => {
                              setMethod(i);
                            },
                          })),
                        )}
                      />
                    </div>
                    <div className="flex h-12 items-center">
                      <Input
                        className="border-[0.5px] rounded-md px-2 p-1 text-gray-900 w-12 text-sm"
                        value={statusValue}
                        placeholder="200"
                        type="text"
                        pattern="[0-9]*"
                        onChange={e => {
                          if (e.target.value === "" || !isNaN(Number(e.target.value))) {
                            setStatusValue(e.target.value);
                          } else {
                            setStatusValue("");
                          }
                        }}
                      />
                    </div>
                    <div className="flex h-12 items-center">
                      <Dropdown
                        label={responseTimeFilter}
                        display={{
                          className:
                            "flex text-xs text-justify tracking-widest hover:bg-slate-600 rounded-md p-[6px] border-[0.5px] border-gray-300 w-28 justify-center me-2",
                        }}
                        options={[
                          ResponseTimeFilter.GREATER_THAN,
                          ResponseTimeFilter.LESS_THAN,
                        ].map(i => ({
                          label: i,
                          onPress: () => setResponseTimeFilter(i),
                        }))}
                      />
                      <Input
                        className="border-[0.5px] rounded-md px-2 p-1 text-gray-900 w-16 text-sm"
                        value={responseTimeValue}
                        placeholder="50"
                        type="text"
                        pattern="[0-9]*"
                        onChange={e => {
                          if (e.target.value === "" || !isNaN(Number(e.target.value))) {
                            setResponseTimeValue(e.target.value);
                          } else {
                            setResponseTimeValue("");
                          }
                        }}
                      />
                      <p className="text-sm ps-1">ms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                label="Filter"
                onClick={() => {
                  setIsFiltersDialogOpen(false);
                  setRequestsSearchValueAtom(searchValue);
                  setRequests(prev => ({
                    ...prev,
                    status: statusValue,
                    method,
                    resTimeLT:
                      responseTimeFilter === ResponseTimeFilter.LESS_THAN ? responseTimeValue : "",
                    resTimeGT:
                      responseTimeFilter === ResponseTimeFilter.GREATER_THAN
                        ? responseTimeValue
                        : "",
                  }));
                }}
                display={{ size: "md", className: "w-28" }}
              />
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
