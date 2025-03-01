import { PropsWithChildren } from "react";
import { Skeleton, SkeletonProps } from "./skeleton";

interface SkeletonWrapperProps extends SkeletonProps {
  isLoading: boolean;
}

export function SkeletonWrapper({
  isLoading,
  children,
  size,
  extraClasses,
}: PropsWithChildren<SkeletonWrapperProps>) {
  if (isLoading) {
    return <Skeleton size={size} extraClasses={extraClasses} />;
  }
  return <div>{children}</div>;
}
