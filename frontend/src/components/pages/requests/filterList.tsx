import { requestsAtom, requestsSearchValueAtom } from "@/atoms/requests";
import { Pill } from "@/components/shared/pill";
import { parsePathName } from "@/components/util";
import { QueryRequestMethod } from "@/enums/api";
import { useAtom } from "jotai";
import { compact } from "lodash";

export function FilterList() {
  const [requests, setRequests] = useAtom(requestsAtom);
  const [searchValue, setSearchValue] = useAtom(requestsSearchValueAtom);
  const searchUrlPathname = searchValue.length ? parsePathName(searchValue) : undefined;
  const appliedFilters: (string | undefined)[] = compact([
    searchUrlPathname &&
      `Search: ${searchUrlPathname.length > 18 ? "..." + searchUrlPathname.substring(searchUrlPathname.length - 18, searchUrlPathname.length) : searchUrlPathname}`,
    requests.method && requests.method !== "ALL" && `Method: ${requests.method}`,
    requests.status && `Status: ${requests.status}`,
    requests.resTimeGT && `> ${requests.resTimeGT} ms`,
    requests.resTimeLT && `< ${requests.resTimeLT} ms`,
  ]);

  return (
    <div className="flex flex-row gap-2">
      {appliedFilters.map(filter => (
        <Pill
          key={filter}
          label={filter}
          onClick={() => {
            switch (true) {
              case filter?.startsWith("Search"):
                setSearchValue("");
                break;
              case filter?.startsWith("Method"):
                setRequests({ ...requests, method: QueryRequestMethod.ALL });
                break;
              case filter?.startsWith("Status"):
                setRequests({ ...requests, status: "" });
                break;
              case filter?.startsWith(">"):
                setRequests({ ...requests, resTimeGT: "" });
                break;
              case filter?.startsWith("<"):
                setRequests({ ...requests, resTimeLT: "" });
                break;
            }
          }}
          type="transparent"
          icon="cross"
          display={{ className: "py-1 px-3 gap-2" }}
        />
      ))}
    </div>
  );
}
