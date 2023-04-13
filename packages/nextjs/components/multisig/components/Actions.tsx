import { ReactNode } from "react";

export const Actions = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return <div className="flex w-full justify-end gap-2">{children}</div>;
};
