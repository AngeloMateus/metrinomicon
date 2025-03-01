import { useSession } from "@/context/session";
import { usePathname, useRouter } from "next/navigation";
import { AiOutlineApi } from "react-icons/ai";
import { GiBlackBook } from "react-icons/gi";
import { LuLogOut, LuSettings } from "react-icons/lu";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { useMediaQuery } from "react-responsive";

export function Sidebar() {
  const router = useRouter();
  const currentPath = usePathname();
  const { logout } = useSession();
  const isMobile = useMediaQuery({ maxWidth: 1023 });

  const navItems = [
    {
      icon: MdOutlineSpaceDashboard,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: AiOutlineApi,
      label: "Requests",
      path: "/dashboard/requests",
    },
    {
      icon: LuSettings,
      label: "Settings",
      path: "/dashboard/settings",
    },
  ];
  if (!isMobile) {
    return (
      <nav className="flex py-2 px-1 justify-center max-h-screen overflow-auto my-3 ml-3 shadow-[0px_0px_1px_1px_rgba(0,0,0,0.1)] rounded-xl bg-admin-bg-dark">
        <div className="flex flex-col px-2 w-full justify-between">
          <div>
            <div className="flex flex-row gap-2 items-center pb-4">
              <GiBlackBook size={22} />
              <h1 className="text-xl font-bold text-white">Metrinomicon</h1>
            </div>
            {navItems.map((item, index) => (
              <button
                key={index + item.label}
                onClick={() => {
                  currentPath !== item.path && router.push(item.path);
                }}
                className={`flex rounded-md  w-full py-2 my-1 ${currentPath === item.path ? "bg-slate-600/30 shadow-[0px_0px_1px_1px_rgba(0,0,0,0.04)]" : " bg-transparent hover:bg-slate-600/15 "} justify-start items-center`}>
                <item.icon className="w-12" size={18} />
                {item.label}
              </button>
            ))}
          </div>
          <div>
            <button
              onClick={() => logout()}
              className={`flex rounded-md hover:bg-slate-600/10 w-full py-2 my-1 justify-start items-center`}>
              <LuLogOut className="w-12 rotate-180" size={18} />
              Sign out
            </button>
          </div>
        </div>
      </nav>
    );
  } else {
    return (
      <nav className="flex h-full sm:h-auto py-2 justify-center my-3 ml-3 shadow-[0px_0px_1px_1px_rgba(0,0,0,0.1)] rounded-xl bg-admin-bg-dark">
        <div className="flex flex-col  px-4 justify-between  h-full">
          <div>
            {navItems.map((item, index) => (
              <button
                key={index + item.label}
                onClick={() => (currentPath === item.path ? null : router.push(item.path))}
                className={`flex rounded-lg hover:bg-slate-600/30 w-full py-2 my-1 ${currentPath === item.path ? "bg-slate-600/30 shadow-[0px_0px_1px_1px_rgba(0,0,0,0.1)]" : "bg-transparent"} justify-start items-center`}>
                <item.icon className="w-9" size={18} />
              </button>
            ))}
          </div>
          <div>
            <button
              onClick={() => logout()}
              className={`flex rounded-lg hover:bg-slate-600/30 w-full py-2 my-1 justify-start items-center`}>
              <LuLogOut className="w-9 rotate-180 -left-1" size={18} />
            </button>
          </div>
        </div>
      </nav>
    );
  }
}
