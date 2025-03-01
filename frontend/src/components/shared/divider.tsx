interface DividerProps {
  color: "dark" | "light";
}
export function Divider({ color }: DividerProps) {
  return (
    <div
      className={`border-t-[0.5px] ${color === "dark" ? "border-admin-dark" : "border-admin-light"}`}></div>
  );
}
