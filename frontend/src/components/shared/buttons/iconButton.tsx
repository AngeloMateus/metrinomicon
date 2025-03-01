import { BiPlus } from "react-icons/bi";
import { RiFilterLine } from "react-icons/ri";
import { buttonStyles } from "../../styles";
import { Spinner } from "../spinner";
import { BaseButtonProps, ButtonDisplay } from "./button";

interface IconButtonProps extends BaseButtonProps {
  icon: keyof typeof icons;
}

const icons = {
  plus: BiPlus,
  filter: RiFilterLine,
};

export function IconButton({ icon, onClick, disabled, label, loading, display }: IconButtonProps) {
  const IconComponent = icons[icon];
  const { className }: ButtonDisplay = {
    className: "",
    ...display,
  };
  const innerButtonStyles = buttonStyles[display?.type || "primary"];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${display?.size === "md" ? innerButtonStyles.buttonHoverMd : innerButtonStyles.buttonHoverSm} ${className} items-center gap-2`}>
      {icon && <IconComponent />}
      {loading ? (
        <Spinner size={24} display={{ containerStyle: "py-[1px]" }} />
      ) : (
        <p className="text-sm py-[3px]">{label}</p>
      )}
    </button>
  );
}
