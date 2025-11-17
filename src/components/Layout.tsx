import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import PageHeader, { type PageHeaderProps } from "./PageHeader";

interface LayoutProps extends PageHeaderProps {
  children: ReactNode;
}

export default function Layout({ children, ...headerProps }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <PageHeader {...headerProps} />
        {children}
      </main>
    </div>
  );
}

