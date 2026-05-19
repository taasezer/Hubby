import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { RepositorySection } from "@/components/sections/RepositorySection";
import { TeamSection } from "@/components/sections/TeamSection";
import { WorkflowSection } from "@/components/sections/WorkflowSection";
import { RoadmapSection } from "@/components/sections/RoadmapSection";
import { AISection } from "@/components/sections/AISection";
import { TechStackSection } from "@/components/sections/TechStackSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <RepositorySection />
        <TeamSection />
        <WorkflowSection />
        <RoadmapSection />
        <AISection />
        <TechStackSection />
      </main>
      <Footer />
    </>
  );
}
