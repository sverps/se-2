import { ReactNode } from "react";

export const Pane = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return (
    <div className="flex flex-col w-full bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 py-6 gap-4">
      {children}
    </div>
  );
};
