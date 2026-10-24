import { useEffect, useRef } from 'react';
import type Lenis from 'lenis';
import { initSmoothScroll } from '@/shared/utils/smoothScroll';
import { MembershipHeroSection } from '@/features/membership/components/MembershipHeroSection';
import { WhyJoinSection } from '@/features/membership/components/WhyJoinSection';
import { MembershipBenefitsSection } from '@/features/membership/components/MembershipBenefitsSection';
import { RecruitmentSection } from '@/features/membership/components/RecruitmentSection';

export const MembershipPage = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const cleanup = initSmoothScroll(lenisRef);
    return cleanup;
  }, []);

  const handleScrollToPositions = () => {
    const element = document.getElementById('positions');
    if (lenisRef.current && element) {
      lenisRef.current.scrollTo(element, { offset: -40 });
    } else if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background">
      <MembershipHeroSection onJoinClick={handleScrollToPositions} />
      <WhyJoinSection />
      <MembershipBenefitsSection />
      <RecruitmentSection />
    </div>
  );
};

export default MembershipPage;
