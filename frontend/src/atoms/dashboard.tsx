import { atom } from "jotai";

interface DashboardAtom {
  timeframeFrom: number;
}
export const dashboardAtom = atom<DashboardAtom>({ timeframeFrom: 2 });

export const setDashboardAtom = atom<DashboardAtom, [DashboardAtom], void>(
  get => get(dashboardAtom),
  (_get, set, newDashboardAtom) => {
    set(dashboardAtom, newDashboardAtom);
  },
);
