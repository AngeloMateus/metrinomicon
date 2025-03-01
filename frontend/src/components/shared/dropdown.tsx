import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

type DropdownOptions = {
  label: string;
  onPress: VoidFunction;
};
interface DropdownProps {
  options: DropdownOptions[];
  label: string;
  disabled?: boolean;
  display?: {
    className?: string;
    style?: React.CSSProperties;
  };
}

export const Dropdown = ({ options, label, display, disabled }: DropdownProps) => {
  return (
    <Popover>
      <PopoverButton onClick={() => {}} disabled={disabled} className={display?.className || ""}>
        <p>{label}</p>
      </PopoverButton>
      <PopoverPanel
        anchor="bottom"
        transition
        className="flex flex-col items-center origin-bottom mt-2 shadow-xl bg-gray-600 z-10 rounded-lg overflow-hidden transition duration-75 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 p-1 ">
        {({ close }) => (
          <>
            {options.map(option => (
              <button
                disabled={disabled}
                key={option.label}
                onClick={() => {
                  option.onPress();
                  close();
                }}
                className="flex w-full justify-center px-[7px] py-2 h-full text-sm hover:bg-gray-700 rounded disabled:opacity-50">
                {option.label}
              </button>
            ))}
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
};
