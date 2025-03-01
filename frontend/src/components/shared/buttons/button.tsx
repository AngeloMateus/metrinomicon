import { buttonStyles } from "../../styles";
import { Spinner } from "../spinner";

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  display?: ButtonDisplay;
}

export interface ButtonDisplay {
  size?: "lg" | "md" | "sm";
  className?: string;
  type?: "primary" | "secondary";
}

export type BaseButtonProps = ButtonProps;

export function Button({ onClick, disabled, display, loading, label }: ButtonProps) {
  const { className }: ButtonDisplay = {
    ...display,
  };

  const buttonSize = () => {
    switch (display?.size) {
      case "lg":
        return buttonStyles[display?.type || "primary"].buttonHover;
      case "md":
        return buttonStyles[display?.type || "primary"].buttonHoverMd;
      case "sm":
        return buttonStyles[display?.type || "primary"].buttonHoverSm;
      default:
        return buttonStyles[display?.type || "primary"].buttonHoverMd;
    }
  };
  const spinnerYPadding = () => {
    switch (display?.size) {
      case "lg":
        return "py-[1px]";
      case "md":
        return "py-[5.5px]";
      case "sm":
        return "py-[5.5px]";
      default:
        return "py-[3px]";
    }
  };

  const isDisabled = disabled || loading;
  const innerclassName = `${buttonSize()} ${className}
    ${isDisabled ? "bg-slate-600/30 text-gray-400" : ""}`;

  return (
    <button
      disabled={isDisabled}
      onClick={() => {
        onClick();
      }}
      className={innerclassName}>
      {loading ? (
        <Spinner size={24} display={{ containerStyle: spinnerYPadding() }} />
      ) : (
        <p className="text-sm py-[3px]">{label}</p>
      )}
    </button>
  );
}
