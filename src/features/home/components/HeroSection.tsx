import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SwishUnderline } from './SwishUnderline';
import { FeatureCard } from './FeatureCard';
import { SponsorsMarquee } from './SponsorsMarquee';
import { LightRays } from '@/shared/components/ui/LightRays';
import { FloatingParticles } from '@/shared/components/ui/FloatingParticles';
import { HiUsers, HiLightningBolt, HiGlobeAlt } from 'react-icons/hi';
import { PageHeroSection } from '@/shared/components/PageHeroSection';

interface HeroSectionProps {
  activeCardIndex: number;
  onCardExpand: (index: number) => void;
}

export const HeroSection = ({
  activeCardIndex,
  onCardExpand,
}: HeroSectionProps) => {
  const backgrounds = (
    <>
      <LightRays
        backgroundColor="var(--color-background)"
        raysColor={{ mode: 'multi', color1: '#00529b', color2: '#00aeef' }}
        rayCount={14}
        opacity={0.75}
        style={{ zIndex: 0 }}
      />
      <FloatingParticles count={24} color="var(--color-info)" className="z-1" />
    </>
  );

  const ctaContent = (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
      <Link to="/join" className="w-full sm:w-auto">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl group text-center"
        >
          <span>Join IEEE CUSB</span>
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-300 shrink-0">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </motion.div>
      </Link>

      <Link to="/about" className="w-full sm:w-auto">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold border border-border text-foreground hover:bg-surface transition-all text-center"
        >
          Learn More
        </motion.div>
      </Link>
    </div>
  );

  const bottomSection = (
    <>
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <FeatureCard
          variant="main"
          title="Student Community"
          description="Join 500+ engineering students advancing technology through collaborative projects."
          bgPattern="waves1"
          icon={<HiUsers />}
          index={0}
          activeIndex={activeCardIndex}
          onExpand={onCardExpand}
          delay={0}
        />
        <FeatureCard
          variant="secondary"
          title="Technical Excellence"
          description="World-class workshops in AI, robotics, and emerging technologies."
          bgPattern="waves2"
          icon={<HiLightningBolt />}
          index={1}
          activeIndex={activeCardIndex}
          onExpand={onCardExpand}
          delay={0.1}
        />
        <FeatureCard
          variant="secondary"
          title="Global Network"
          description="Connect with 400,000+ IEEE members across 160 countries."
          bgPattern="waves3"
          icon={<HiGlobeAlt />}
          index={2}
          activeIndex={activeCardIndex}
          onExpand={onCardExpand}
          delay={0.2}
        />
      </div>
      <SponsorsMarquee />
    </>
  );

  return (
    <PageHeroSection
      layout="split-text"
      eyebrow="Student Innovation • Technology • Community"
      title={
        <>
          Discover the <SwishUnderline>power</SwishUnderline> of engineering on your terms
        </>
      }
      description="Join IEEE Cairo University Student Branch and unlock opportunities for professional growth, technical excellence, and innovation."
      ctaContent={ctaContent}
      bottomContent={bottomSection}
      backgroundContent={backgrounds}
      className="min-h-screen flex-col overflow-hidden bg-background !pt-0 !pb-0 !px-0 flex md:!items-center"
      containerClassName="flex-1 flex flex-col justify-center px-4 sm:px-6 pt-20 pb-10 md:pt-32 md:pb-16"
      titleClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6"
      descriptionClassName="text-sm sm:text-base md:text-lg text-text-muted leading-relaxed"
      showDotGrid={false}
    />
  );
};
