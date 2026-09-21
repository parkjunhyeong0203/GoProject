import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project TDL - JWT REST API Todo & 일정 관리 대시보드",
  description: "Go/Gin 백엔드와 완벽 연동되는 현대적인 JWT 기반 Todo 및 일정 관리 캘린더 애플리케이션",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
