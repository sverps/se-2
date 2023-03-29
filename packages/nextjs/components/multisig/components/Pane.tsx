import { ReactNode } from "react";

export const Pane = ({ className, children }: { className?: string; children: ReactNode | ReactNode[] }) => {
  return (
    <div
      className={`flex flex-col w-full bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 py-6 ${className}`}
    >
      {children}
    </div>
  );
};
