import { useApi } from "@/context/api/context";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState } from "react";
import { Button } from "../../shared/buttons/button";
import { IconButton } from "../../shared/buttons/iconButton";
import { Dropdown } from "../../shared/dropdown";

export function UptimeForm() {
  const [isUptimeFormOpen, setIsUptimeFormOpen] = useState(false);
  const [pingFrequency, setPingFrequency] = useState(5);
  const [pingMethod, setPingMethod] = useState("GET");
  const [uptimeUrl, setUptimeUrl] = useState("");
  const [uptimeName, setUptimeName] = useState("");
  const { postUptimeSettings } = useApi();
  const {
    mutateAsync: submitUptimeSettings,
    isPending: isSubmittingUptimeSettings,
    isSuccess,
  } = postUptimeSettings();

  const isLoadingForm = isSubmittingUptimeSettings;
  useEffect(() => {
    if (isSuccess) {
      setIsUptimeFormOpen(false);
    }
  }, [isSuccess]);

  return (
    <>
      <h3 className="text-lg">API Reliability</h3>
      <p className="text-md">
        Setup status endpoints here. Uptime and reliability data will be displayed from the
        dashboard.
      </p>
      <Dialog
        open={isUptimeFormOpen}
        onClose={() => setIsUptimeFormOpen(false)}
        transition
        className="fixed flex w-screen items-center justify-center bg-black/50 p-4 transition duration-100 ease-out data-[closed]:opacity-0 ">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/20 duration-100 ease-out data-[closed]:opacity-0 "
        />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4 text-sm">
          <DialogPanel
            transition
            className="max-w-lg space-y-4 border-[0.5px] rounded-lg shadow-lg bg-admin-bg-secondary-dark p-6 transition duration-75 ease-out data-[closed]:translate-y-2">
            <DialogTitle className={"text-center"}>Add service endpoint</DialogTitle>
            <div className="flex flex-row items-start gap-6 pb-4">
              <div className="flex flex-col items-start">
                <p className="flex h-12 items-center">Service name</p>
                <p className="flex h-12 items-center">URL</p>
                <p className="flex h-12 items-center">Frequency</p>
                <p className="flex h-12 items-center">Method</p>
              </div>
              <div className="flex flex-col items-start">
                <div className="flex h-12 items-center">
                  <input
                    type="text"
                    className="border-[0.5px] rounded-md px-2 p-1 text-gray-900"
                    placeholder="API"
                    onChange={({ target }) => setUptimeName(target.value)}
                  />
                </div>
                <div className="flex h-12 items-center">
                  <input
                    type="text"
                    className="border-[0.5px] rounded-md px-2 p-1 text-gray-900"
                    placeholder="Setup a url to ping"
                    defaultValue={uptimeUrl}
                    onChange={({ target }) => setUptimeUrl(target.value)}
                  />
                </div>
                <div className="flex h-12 items-center">
                  <Dropdown
                    display={{
                      className:
                        "flex text-sm justify-center tracking-widest border-[0.5px] hover:bg-slate-600 rounded-md p-1 px-2",
                    }}
                    label={`Ping every ${pingFrequency} minute${pingFrequency > 1 ? "s" : ""}`}
                    options={Array.from(
                      ["1", "5", "15", "30", "60"].map(i => ({
                        label: `${i} minute${i === "1" ? "" : "s"}`,
                        onPress: () => {
                          setPingFrequency(parseInt(i));
                        },
                      })),
                    )}
                  />
                </div>
                <div className="flex h-12 items-center">
                  <Dropdown
                    label={`${pingMethod}`}
                    display={{
                      className:
                        "flex text-sm justify-center tracking-widest border-[0.5px] hover:bg-slate-600 rounded-md p-1 px-2",
                    }}
                    options={Array.from(
                      ["GET", "POST"].map(i => ({
                        label: i,
                        onPress: () => {
                          setPingMethod(i);
                        },
                      })),
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                label="Submit"
                disabled={!uptimeUrl.length || !uptimeName.length || isLoadingForm}
                onClick={async () =>
                  submitUptimeSettings({
                    enabled: true,
                    interval: pingFrequency * 60,
                    method: pingMethod,
                    url: uptimeUrl,
                    name: uptimeName,
                  })
                }
                display={{ size: "md", className: "w-28" }}
              />
            </div>
          </DialogPanel>
        </div>
      </Dialog>
      <IconButton
        label="Add"
        display={{ size: "md", className: "w-28 my-3" }}
        icon="plus"
        onClick={() => setIsUptimeFormOpen(true)}
      />
    </>
  );
}
