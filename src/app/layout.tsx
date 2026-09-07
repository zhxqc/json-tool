import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/structured-data";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE } from "@/config/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "JSON 格式化与查看 — 快速、私密的在线 JSON 工具",
    template: `%s | ${SITE.name}`,
  },
  description:
    "快速、私密、简洁的在线 JSON 工具。在浏览器中直接完成 JSON 的格式化、校验、压缩与修复，内容不会上传到任何服务器。",
  applicationName: SITE.name,
  keywords: [
    "json formatter",
    "json viewer",
    "json validator",
    "json minifier",
    "json repair",
    "pretty print json",
    "json tools",
    "json 格式化",
    "json 校验",
    "json 压缩",
    "json 修复",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: "JSON 工具 — 格式化、校验、压缩与修复",
    description: "快速、私密、简洁的在线 JSON 工具。格式化、校验、压缩、修复全部在浏览器本地完成，不上传任何内容。",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "JSON 工具 — 格式化、校验、压缩与修复",
    description: "快速、私密、简洁的开发者 JSON 工具，100% 在浏览器本地运行。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  alternateName: "JSON · imnice",
  url: SITE.url,
  description: SITE.tagline,
  inLanguage: "zh-CN",
  publisher: {
    "@type": "Organization",
    name: SITE.parentBrand,
    url: SITE.parentUrl,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col bg-background text-foreground md:h-dvh md:overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
          >
            跳到主要内容
          </a>
          <SiteHeader />
          <div id="main" className="flex min-h-0 flex-1 flex-col">
            {children}
          </div>
          <SiteFooter />
          <JsonLd data={websiteSchema} />
        </ThemeProvider>
        <Script id="baidu-analytics" strategy="beforeInteractive">
          {`
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?65ecfc3971d81bf0e9f2f71375005488";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
`}
        </Script>
      </body>
    </html>
  );
}
