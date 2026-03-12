import HeroSlideshow from "./HeroSlideshow";
import Marquee from "./Marquee";
import FeaturesGrid from "./FeaturesGrid";
import StatsBar from "./StatsBar";
import SpecialtySection from "./SpecialtySection";

export default function Home() {
  return (
    <>
      <HeroSlideshow />
      <Marquee />
      <FeaturesGrid />
      <StatsBar />
      <SpecialtySection />
    </>
  );
}
