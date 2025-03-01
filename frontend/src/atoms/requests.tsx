import { QueryRequestMethod } from "@/enums/api";
import { atom } from "jotai";

const ONE_DAY_IN_MILLISECONDS = 86400000;

interface RequestsAtom extends RequestsResponse {
  currentItem: number;
  itemsPerPage: number;
  method?: QueryRequestMethod;
  timeRangeFrom: string;
  timeRangeTo: string;
  customFrom?: string;
  status?: string;
  resTimeLT?: string;
  resTimeGT?: string;
}
export const requestsAtom = atom<RequestsAtom>({
  currentItem: 0,
  itemsPerPage: 15,
  method: QueryRequestMethod.ALL,
  timeRangeFrom: new Date(Date.now() - ONE_DAY_IN_MILLISECONDS).toISOString(),
  timeRangeTo: new Date(Date.now()).toISOString(),
  status: "",
  resTimeLT: "",
  resTimeGT: "",
} as RequestsAtom);

export const setRequestsAtom = atom<RequestsAtom, [RequestsAtom], void>(
  get => get(requestsAtom),
  (_get, set, newRequests) => {
    set(requestsAtom, newRequests);
  },
);

export const requestsSearchValueAtom = atom<string>("");

export const setRequestsSearchValueAtom = atom<string, [string], void>(
  get => get(requestsSearchValueAtom),
  (_get, set, newSearchValue) => {
    set(requestsSearchValueAtom, newSearchValue);
  },
);
