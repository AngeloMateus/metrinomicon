import { useState } from "react";
import { BiCalendar } from "react-icons/bi";
import { buttonStyles } from "../styles";

interface ButtonGroupProps {
  buttons: ButtonGroupItem[];
  onChange?: (index: number) => void;
  display?: Display;
  initialIndex?: number;
}

type ButtonGroupItem = {
  label?: string;
  icon?: keyof typeof icons;
};

const icons = {
  calendar: BiCalendar,
};

interface Display {
  borderColor: "border-admin-bg-dark" | "border-bg-dark" | "border-admin-bg-secondary-dark";
  buttonClassName?: string;
}

export default function ButtonGroup({
  buttons,
  display,
  onChange,
  initialIndex,
}: ButtonGroupProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex || 0);
  const { borderColor }: Display = {
    borderColor: "border-admin-bg-dark",
    ...display,
  };

  return (
    <div className="flex flex-row items-center">
      {buttons.map((button, index) => {
        const IconComponent = button.icon ? icons[button?.icon] : null;
        const isLeftMost = index === 0;
        const isRightMost = index === buttons.length - 1;
        return (
          <button
            key={index}
            onClick={() => {
              setSelectedIndex(index);
              onChange?.(index);
            }}
            className={`${buttonStyles.primary.buttonHoverSm} text-nowrap rounded-none px-4 ${index === selectedIndex ? "border-white" : borderColor} ${isLeftMost ? "rounded-l-md" : isRightMost ? "rounded-r-md" : ""} ${display?.buttonClassName || ""}`}>
            {!!IconComponent && <IconComponent className="h-5" />}
            {!!button?.label && button.label}
          </button>
        );
      })}
    </div>
  );
}
