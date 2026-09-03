import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gvcncdsai.io.vn"),
  title: "Smart Teacher Schedule AI - Dạy Đúng Giờ, Làm Đúng Việc, Không Bỏ Sót",
  description:
    "Ứng dụng Android chuyên nghiệp cho giáo viên với hệ thống nhắc lịch dạy kép 60m & 15m, chống tắt ngầm OEM, Tiện ích Widget màn hình chính 2-trong-1 và Trợ lý AI Gemini.",
  keywords: [
    "Smart Teacher Schedule AI",
    "Lịch dạy giáo viên",
    "Thời khóa biểu thông minh",
    "Made in Huy Technology AI",
    "Widget lịch dạy",
    "AI giáo viên",
  ],
  authors: [{ name: "Huy Technology AI", url: "https://github.com/HuyTechonologyAI" }],
  openGraph: {
    title: "Smart Teacher Schedule AI - Trợ lý Lịch Dạy & Nhắc Việc Giáo Viên",
    description:
      "Tải app v1.2.5 ngay: Báo thức kép 60m & 15m, chống tắt ngầm khi dọn RAM, Widget màn hình chính và tự động làm mới 00:00 hằng ngày.",
    images: [
      {
        url: "/feature_banner.jpg",
        width: 1200,
        height: 630,
        alt: "Smart Teacher Schedule AI Banner",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link rel="icon" href="/app_icon.jpg" />
      </head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
