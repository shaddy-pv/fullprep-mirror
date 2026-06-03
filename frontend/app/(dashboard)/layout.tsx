import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface DashLayoutProps {
  children: React.ReactNode;
}

export default function DashLayout({ children }: DashLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
