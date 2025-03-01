import { FaArrowDown, FaArrowUp, FaMinus, FaX } from "react-icons/fa6";

interface PillProps {
  label?: string;
  type: "success" | "warning" | "error" | "info" | "transparent";
  icon?: keyof typeof icons;
  onClick?: () => void;
  display?: {
    iconSize?: number;
    className: string;
  };
}
const icons = {
  up: FaArrowUp,
  down: FaArrowDown,
  minus: FaMinus,
  cross: FaX,
};

export function Pill({ label, type, icon, display, onClick }: PillProps) {
  const IconComponent = icon ? icons[icon] : null;
  const bg =
    type === "success"
      ? "bg-green-400/75"
      : type === "warning"
        ? "bg-yellow-200"
        : type === "error"
          ? "bg-red-500/75"
          : type === "info"
            ? "bg-blue-100/10"
            : "bg-transparent border-[1px] border-gray-300/30";
  return (
    <button
      onClick={onClick}
      className={`${display?.className} ${bg} flex flex-row rounded-full px-2 items-center justify-center select-none min-h-[16px] gap-1 ${onClick ? "hover:brightness-110 hover:backdrop-brightness-110" : "pointer-events-none"}`}>
      {IconComponent && <IconComponent size={display?.iconSize || 10} />}
      {label && <p className="text-xs">{label}</p>}
    </button>
  );
}
