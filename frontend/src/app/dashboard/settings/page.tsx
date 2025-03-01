"use client";

import MonitoredEndpoints from "@/components/pages/settings/monitoredEndpoints";
import { UptimeForm } from "@/components/pages/settings/uptimeForm";

export default function Settings() {
  return (
    <div className="flex flex-col p-7 w-full">
      <h1>Settings</h1>
      <div className="flex flex-col w-full h-full">
        <div className={`flex flex-1 w-full h-full flex-col gap-4 mt-3 text-sm`}>
          <UptimeForm />
          <MonitoredEndpoints />
        </div>
      </div>
    </div>
  );
}
