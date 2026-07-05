import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LocationToast from "@/components/ui/LocationToast";
import CreatePasswordModal from "@/components/ui/CreatePasswordModal";

interface DashLayoutProps {
  children: React.ReactNode;
}

export default function DashLayout({ children }: DashLayoutProps) {
  return (
    <DashboardLayout>
      {children}
      <LocationToast />
      <CreatePasswordModal />
    </DashboardLayout>
  );
}
