import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/Providers';
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Fitness Iraq | منصتك التدريبية، هويتك الخاصة",
  description: "المنصة الأولى للمدربين في العراق لإنشاء تطبيقاتهم الخاصة وإدارة المتدربين بذكاء.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster position="bottom-center" />
        </Providers>
      </body>
    </html>
  );
}
