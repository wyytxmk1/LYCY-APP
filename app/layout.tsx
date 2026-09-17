import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "流畅说 · 口吃训练",
  description: "为学员提供评估、日常训练、课程学习与训练记录。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className="antialiased">{children}</body></html>;
}

