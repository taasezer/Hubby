import { Navbar } from "@/components/layout/Navbar";
import { SectionNav } from "@/components/layout/SectionNav";
import { HeroSection } from "@/components/sections/HeroSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <SectionNav />
      <main className="flex-1">
        <HeroSection />
      </main>
      <Footer />
    </>
  );
}
