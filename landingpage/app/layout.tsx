import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gvcncdsai.io.vn"),
  title: "EduViet - Cùng tri thức, Vững tương lai | Smart Teacher Schedule AI",
  description:
    "Hệ sinh thái Đa Nền Tảng (Android, Web, Desktop, iOS) cho giáo viên: Báo thức ca dạy kép 60m & 15m, tối ưu hóa đa tầng chống tắt ngầm, Sổ lớp & Điểm danh 1 chạm, Đồng bộ đám mây và Trợ lý AI Sư phạm CV 5512.",
  keywords: [
    "Smart Teacher Schedule AI",
    "Lịch dạy giáo viên",
    "Thời khóa biểu thông minh",
    "Made in Huy Technology AI",
    "Widget lịch dạy",
    "AI giáo viên",
  ],
  authors: [
    { name: "Huy Technology AI Hub", url: "https://huycncdsai.io.vn" },
    { name: "SmartTax AI", url: "https://smarttax-ai.vercel.app" }
  ],
  creator: "Ngô Quốc Huy - Huy Technology AI",
  publisher: "Huy Technology AI Hub",
  alternates: {
    canonical: "https://huycncdsai.io.vn",
  },
  openGraph: {
    title: "Smart Teacher Schedule AI - Trợ lý Sư Phạm & Lịch Dạy Giáo Viên v1.8.0",
    description:
      "Tải app v1.8.0 chính thức: Hệ sinh thái Đa Nền Tảng (Android, Web, Desktop), Sổ điểm & Học bạ điện tử Thông tư 22, Trợ lý AI Soạn bài CV 5512, Đề thi Ma trận đặc tả, Voice AI Tutor và Bản quyền Huy Technology AI.",
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
        {/* Structured Data: Google Schema JSON-LD for Tri-Ecosystem Authority */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://huycncdsai.io.vn/#organization",
                  "name": "Huy Technology AI Hub",
                  "url": "https://huycncdsai.io.vn",
                  "logo": "https://huycncdsai.io.vn/logo.png",
                  "founder": {
                    "@type": "Person",
                    "name": "Ngô Quốc Huy"
                  },
                  "sameAs": [
                    "https://smarttax-ai.vercel.app",
                    "https://github.com/HuyTechonologyAI"
                  ],
                  "description": "Viện Công nghệ & Chuyển đổi số đa ngành: Trí tuệ nhân tạo Sư phạm Giáo dục và Kê khai Thuế Doanh nghiệp."
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://huycncdsai.io.vn/#software-teacher",
                  "name": "Smart Teacher Schedule AI (EduViet)",
                  "applicationCategory": "EducationalApplication",
                  "operatingSystem": "Web, Android, Windows Desktop, iOS PWA",
                  "offers": {
                    "@type": "Offer",
                    "price": "399000",
                    "priceCurrency": "VND"
                  },
                  "parentOrganization": {
                    "@id": "https://huycncdsai.io.vn/#organization"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://smarttax-ai.vercel.app/#software-tax",
                  "name": "SmartTax AI",
                  "url": "https://smarttax-ai.vercel.app",
                  "applicationCategory": "BusinessApplication",
                  "parentOrganization": {
                    "@id": "https://huycncdsai.io.vn/#organization"
                  }
                }
              ]
            })
          }}
        />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/app_logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SmartTeacher" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('smart_teacher_theme');
                if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}

              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration error:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
