import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NashrClip AI | لوحة التحكم",
  description: "لوحة تشغيل أولية لبناء نظام إنتاج فيديوهات بالذكاء الاصطناعي مع مراجعة بشرية قبل النشر.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
