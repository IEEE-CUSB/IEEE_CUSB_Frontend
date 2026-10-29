import { PageHeroSection } from '@/shared/components/PageHeroSection';

interface MembershipHeroSectionProps {
  onJoinClick?: () => void;
}

export const MembershipHeroSection = ({ onJoinClick }: MembershipHeroSectionProps) => {
  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onJoinClick) {
      onJoinClick();
    } else {
      const el = document.getElementById('positions');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <PageHeroSection
      eyebrow="Join • Connect • Grow"
      title="Become an IEEE CUSB Member"
      description="Join a global community of technology professionals, build your network, access exclusive resources, and accelerate your career. Take the first step towards shaping the future of engineering."
      ctaContent={
        <a
          href="#positions"
          onClick={handleJoinClick}
          className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Join Now →
        </a>
      }
    />
  );
};
