"use client";
import { Sidebar } from "@/components/pages/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-row h-screen items-center justify-center bg-admin-bg-secondary-dark">
      <div className="flex flex-1 w-screen h-full bg-admin-bg-secondary-dark fixed ">
        <div className="flex h-screen flex-col sm:flex-row ">
          <Sidebar />
        </div>
        <div
          id={"main-view"}
          className={`flex flex-1 overflow-auto my-3 mx-3 shadow-[0px_0px_1px_1px_rgba(0,0,0,0.1)] rounded-xl bg-admin-bg-dark border-[0.5] border-admin-dark`}>
          {children}
        </div>
      </div>
    </main>
  );
}
