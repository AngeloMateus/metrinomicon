import { useApi } from "@/context/api/context";
import { Button } from "../../shared/buttons/button";

interface UptimeEndpointListItemProps {
  setting: UptimeSetting;
}

export const UptimeEndpointListItem = ({ setting }: UptimeEndpointListItemProps) => {
  const { removeUptimeSettings } = useApi();
  const { mutateAsync: deleteSetting, isPending: isDeleting } = removeUptimeSettings();

  const handleDelete = async () => {
    await deleteSetting(setting.url);
  };
  const intervalInMinutes = setting.interval / 60;

  return (
    <div className="flex w-full flex-row">
      <div className="flex flex-col items-start gap-2 min-w-28 overflow-hidden">
        <p className="py-1 text-nowrap ">{setting.name}</p>
      </div>
      <div className="flex flex-col items-start gap-2 min-w-28">
        <p className="py-1 text-nowrap rounded-md">
          {intervalInMinutes} minute{intervalInMinutes === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 min-w-28">
        <p className="py-1">{setting.method}</p>
      </div>
      <div className="flex flex-col items-start gap-2 w-full justify-center overflow-x-auto">
        <p className="py-1 text-nowrap">{setting.url}</p>
      </div>
      <div className="flex w-24 h-full  flex-row items-center justify-end gap-2">
        <Button
          label="Delete"
          onClick={handleDelete}
          loading={isDeleting}
          display={{ className: "w-20", type: "primary", size: "sm" }}
        />
      </div>
    </div>
  );
};
