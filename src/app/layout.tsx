import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppShell } from "@/components/ui/AppShell";

export const metadata: Metadata = {
  title: "ACM System - University Component Management",
  description: "Hệ thống quản lý linh kiện và thiết bị",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`font-sans bg-slate-50 text-slate-900`}>
        <ErrorBoundary>
          <AppShell>{children}</AppShell>
        </ErrorBoundary>
      </body>
    </html>
  );
}
