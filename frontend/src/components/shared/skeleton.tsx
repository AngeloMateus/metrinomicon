export interface SkeletonProps {
  size: "small" | "medium" | "large";
  extraClasses?: string;
}

export function Skeleton({ size, extraClasses }: SkeletonProps) {
  let innerSize;
  //Tailwind doesn't support dynamic class names, so we need to use a switch statement to set the width and height based on the size prop.
  switch (size) {
    case "small":
      innerSize = "h-[1.5rem] rounded-xl";
      break;
    case "medium":
      innerSize = "h-[2rem] rounded-2xl";
      break;
  }
  return <div className={`animate-pulse bg-gray-200/15 ${extraClasses}` + ` ${innerSize}`} />;
}
