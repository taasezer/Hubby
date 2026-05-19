"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TabLayout } from "@/components/layout/TabLayout";
import { HeroSection } from "@/components/sections/HeroSection";
import { RepositorySection } from "@/components/sections/RepositorySection";
import { TeamSection } from "@/components/sections/TeamSection";
import { DashboardSection } from "@/components/sections/DashboardSection";
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
        <TabLayout>
          {{
            repositories: <RepositorySection />,
            team: <TeamSection />,
            dashboard: <DashboardSection />,
            workflow: <WorkflowSection />,
            roadmap: <RoadmapSection />,
            "ai-systems": <AISection />,
            "tech-stack": <TechStackSection />,
          }}
        </TabLayout>
      </main>
      <Footer />
    </>
  );
}
