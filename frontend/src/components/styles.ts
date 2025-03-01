interface ButtonStylesContainer {
  buttonDisabled: string;
  button: string;
  buttonHover: string;
  buttonHoverMd: string;
  buttonHoverSm: string;
}

export const buttonStyles = {
  primary: {
    buttonDisabled:
      "flex w-full shadow-form rounded-xl bg-red-700/60 py-2 sm:py-3.5 text-base font-semibold outline-none justify-center pointer-events-none text-neutral-300 select-none",
    button:
      "flex w-full shadow-form rounded-xl bg-cyan-700/70 bg-slate-700 py-2 sm:py-3.5 text-base font-semibold outline-none justify-center select-none",
    buttonHover:
      "flex w-full hover:shadow-form hover:bg-slate-600/30 rounded-xl hover:bg-cyan-700/60 bg-slate-700 py-2 sm:py-3 text-base font-semibold outline-none justify-center select-none",
    buttonHoverMd:
      "flex hover:shadow-form enabled:hover:bg-slate-600/30 rounded-md enabled:bg-slate-700 py-1 sm:py-1 text-base font-semibold outline-none justify-center select-none items-center",
    buttonHoverSm:
      "flex hover:shadow-form hover:bg-slate-600/30 rounded-[3px] bg-gray-500/30 hover:bg-cyan-700/60 px-1 text-sm outline-none justify-center items-center border-[0.5px] select-none",
  } as ButtonStylesContainer,
  secondary: {
    buttonDisabled:
      "flex w-full shadow-form bg-slate-600/20 rounded-xl bg-gray-700/60 bg-gray-700 py-2 sm:py-3.5 text-base font-semibold outline-none justify-center pointer-events-none text-neutral-300 select-none",
    button:
      "flex w-full shadow-form bg-slate-600/30 rounded-xl bg-gray-700/60 bg-gray-700 py-2 sm:py-3.5 text-base font-semibold outline-none justify-center select-none",
    buttonHover:
      "flex w-full hover:shadow-form hover:bg-slate-600/30 rounded-xl bg-gray-700/60 bg-gray-700 py-2 sm:py-3 text-base font-semibold outline-none justify-center select-none",
    buttonHoverMd:
      "flex enabled:hover:bg-slate-600/30 rounded-md border-admin-light bg-transparent border-[0.5px] py-1 sm:py-1 text-base font-semibold outline-none justify-center select-none items-center",
    buttonHoverSm:
      "flex hover:shadow-form hover:bg-slate-600/30 rounded-[3px] bg-transparent border-[0.5px] hover:bg-gray-700/60 px-1 text-sm outline-none justify-center items-center border-[0.5px] select-none",
  } as ButtonStylesContainer,
};

export const styles = {
  card: "flex flex-1 rounded-md bg-admin-bg-secondary-dark shadow-lg",
};
