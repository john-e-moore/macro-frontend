import { listMetrics } from "@/lib/catalog";

import { LandingPage } from "@/components/landing-page";

export default function Home() {
  return <LandingPage metrics={listMetrics()} />;
}
