import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CoachJourney from "@/components/CoachJourney";
import Marketplace from "@/components/Marketplace";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import GlobalBackground from "@/components/GlobalBackground";

import { getMarketplaceCoaches } from "@/actions/coach";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const dbCoaches = await getMarketplaceCoaches();

  return (
    <main className="min-h-screen bg-transparent text-foreground flex flex-col relative">
      <GlobalBackground />
      <Navbar />
      <Hero />
      <CoachJourney />
      <Marketplace initialCoaches={dbCoaches} />
      <Pricing />
      <Footer />
    </main>
  );
}
