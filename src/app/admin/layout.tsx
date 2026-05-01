import type { Metadata } from "next";
import { AdminAppShell } from "@/components/admin";

export const metadata: Metadata = {
  title: "Admin | Brand Pixel World",
  description: "관리자 대시보드",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminAppShell>{children}</AdminAppShell>;
}
