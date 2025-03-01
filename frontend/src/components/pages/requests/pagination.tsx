import { requestsAtom } from "@/atoms/requests";
import { useAtom } from "jotai";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { Dropdown } from "../../shared/dropdown";

export interface PaginationProps {
  onChange?: () => void;
}

export function Pagination({ onChange }: PaginationProps) {
  const [requests, setRequests] = useAtom(requestsAtom);
  const totalItems = requests?.totalItems ?? 0;
  const itemsPerPage = requests?.itemsPerPage ?? 15;
  const index = requests?.currentItem ?? 0;

  const prevDisabled = index === 0;
  const nextDisabled = index + itemsPerPage >= totalItems;

  return (
    <div className="flex justify-center items-center gap-2 text-nowrap">
      <Dropdown
        label={`${index + 1}-${Math.min(index + 1 + itemsPerPage, totalItems)} of ${totalItems}`}
        disabled={totalItems <= 15}
        display={{
          className: "text-sm text-justify tracking-widest hover:bg-slate-600 rounded-md p-1",
        }}
        options={Array.from(
          ["15", "50", "100"].map(i => ({
            label: i,
            onPress: () => {
              setRequests(prev => ({
                ...prev,
                itemsPerPage: parseInt(i),
              }));
            },
          })),
        )}
      />
      <button
        className={`${prevDisabled ? "text-gray-400" : ""}`}
        onClick={() => {
          onChange?.();
          setRequests(prev => ({
            ...prev,
            currentItem: Math.max((prev?.currentItem ?? 1) - itemsPerPage, 0),
          }));
        }}
        disabled={prevDisabled}>
        <MdKeyboardArrowLeft className="text-lg" />
      </button>
      <button
        className={`${nextDisabled ? "text-gray-400" : ""}`}
        onClick={() => {
          onChange?.();
          setRequests(prev => ({
            ...prev,
            currentItem: Math.min((prev?.currentItem ?? 0) + itemsPerPage, totalItems),
          }));
        }}
        disabled={nextDisabled}>
        <MdKeyboardArrowRight className="text-lg" />
      </button>
    </div>
  );
}
