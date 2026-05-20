"use client";

import { Navbar } from "@/components/layout/Navbar";
import { SectionNav } from "@/components/layout/SectionNav";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <SectionNav />
      <div className="flex-1">{children}</div>
    </>
  );
}
