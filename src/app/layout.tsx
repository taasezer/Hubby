import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hubby — AI-Powered Developer Collaboration Platform",
  description:
    "Hubby unifies repository intelligence, agile workflow management, and AI-assisted development into a single premium platform built for modern engineering teams.",
  keywords: [
    "developer collaboration",
    "AI platform",
    "workflow management",
    "repository analytics",
    "agile development",
    "sprint tracking",
  ],
  authors: [
    { name: "Taha Sezer" },
    { name: "Yunus Emre Sayın" },
    { name: "Bartu Selçuk" },
  ],
  openGraph: {
    title: "Hubby — AI-Powered Developer Collaboration Platform",
    description:
      "Repository intelligence, agile workflows, and AI-assisted development for modern engineering teams.",
    type: "website",
    locale: "en_US",
  },
  icons: null,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
