import { CHAPTERS } from '../constants/committeeData';
import { SectionReveal } from '@/features/home/components/SectionReveal';
import { MemberCard, MemberCardSize } from '@/shared/components/MemberCard';
import { IoMail } from 'react-icons/io5';
import { FaFacebookF, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import ElectricBorder from '@/components/ui/ElectricBorder';

const useResponsiveSize = (
  breakpoints = [
    { maxWidth: 640, size: 'xs' as MemberCardSize },
    { maxWidth: 1024, size: 'xs' as MemberCardSize },
  ],
  defaultSize: MemberCardSize = 'sm'
): MemberCardSize => {
  const getSize = (): MemberCardSize => {
    const w = window.innerWidth;
    for (const bp of breakpoints) {
      if (w <= bp.maxWidth) return bp.size;
    }
    return defaultSize;
  };

  const [size, setSize] = useState<MemberCardSize>(getSize);

  useEffect(() => {
    const handler = () => setSize(getSize());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return size;
};

export const ChaptersSection = () => {
  const boardCardSize = useResponsiveSize();

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 text-foreground">
              Chapters & <span className="text-primary">Affinity Groups</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto font-light">
              Explore our specialized chapters and affinity groups dedicated to
              specific fields and empowering diverse communities.
            </p>
          </div>
        </SectionReveal>

        <div className="flex flex-col gap-16">
          {CHAPTERS.map((chapter, index) => (
            <SectionReveal key={chapter.slug} delay={index * 0.1}>
              <ElectricBorder color={chapter.borderColor}>
                <div className="rounded-2xl p-8  ">
                  <div className="flex flex-col lg:flex-row gap-12 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        {chapter.logo && (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white rounded-full shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center overflow-hidden">
                            <img
                              src={chapter.logo}
                              alt={`${chapter.name} logo`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="text-2xl font-bold text-foreground flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3">
                          <span>{chapter.name}</span>
                          <span className="text-sm font-normal text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {chapter.fullName}
                          </span>
                        </h3>
                      </div>
                      <p className="text-foreground/80 font-light mb-8 leading-relaxed text-lg">
                        {chapter.description}
                      </p>

                      {/* Links */}
                      <div className="flex flex-wrap gap-6">
                        {chapter.email && (
                          <a
                            href={`mailto:${chapter.email}`}
                            className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors"
                          >
                            <IoMail size={22} className="text-primary" />
                            <span className="font-light">{chapter.email}</span>
                          </a>
                        )}
                        {chapter.socialLinks?.facebook && (
                          <a
                            href={chapter.socialLinks.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-foreground/80 hover:text-[#1877F2] transition-colors"
                          >
                            <FaFacebookF size={20} />
                            <span className="font-light">Facebook</span>
                          </a>
                        )}
                        {chapter.socialLinks?.linkedin && (
                          <a
                            href={chapter.socialLinks.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-foreground/80 hover:text-[#0a66c2] transition-colors"
                          >
                            <FaLinkedinIn size={20} />
                            <span className="font-light">LinkedIn</span>
                          </a>
                        )}
                        {chapter.socialLinks?.instagram && (
                          <a
                            href={chapter.socialLinks.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-foreground/80 hover:text-[#E1306C] transition-colors"
                          >
                            <FaInstagram size={20} />
                            <span className="font-light">Instagram</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Board Members */}
                    {chapter.board.length > 0 && (
                      <div className="w-full lg:w-auto rounded-lg p-6">
                        <h4 className="text-xl font-semibold text-foreground mb-6 text-center">
                          Board Members
                        </h4>
                        <div className="flex max-w-xs sm:max-w-md lg:max-w-xl mx-auto flex-wrap justify-center gap-x-16 gap-y-2 sm:gap-6">
                          {chapter.board.map((member, i) => (
                            <MemberCard
                              key={member.name}
                              member={member}
                              size={boardCardSize}
                              roleOverride={member.role.replace('-', '\u2011')}
                              delay={0.2 + i * 0.1}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ElectricBorder>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
