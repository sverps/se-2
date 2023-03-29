import { ReactNode } from "react";

export const Actions = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return <div className="flex w-full justify-end gap-4">{children}</div>;
};
