import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface SpinnerProps {
  size?: number;
  display?: {
    containerStyle: string;
  };
}

export function Spinner({ size = 15, display }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${display?.containerStyle || ""}`}>
      <div className={`rounded-full`}>
        {<AiOutlineLoading3Quarters size={size} className="animate-spin" />}
      </div>
    </div>
  );
}
