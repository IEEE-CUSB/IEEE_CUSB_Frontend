import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageHeroSectionProps {
  /** Small uppercase eyebrow label above the title */
  eyebrow?: ReactNode;
  /** Main heading — accepts strings or JSX (e.g. with SwishUnderline) */
  title: ReactNode;
  /** Supporting paragraph text */
  description?: string;
  
  /** Layout type: 'standard' (left aligned), 'split-text' (left heading, right description) */
  layout?: 'standard' | 'split-text';
  
  /** Content to render below the description (e.g. CTA buttons) */
  ctaContent?: ReactNode;
  
  /** Content for the right column in 'standard' layout */
  rightContent?: ReactNode;
  
  /** Content to render at the bottom of the section (e.g. FeatureCards, Marquee) */
  bottomContent?: ReactNode;
  children?: ReactNode; // Alias for bottomContent
  
  /** Background elements (Particle, LightRays, etc.) placed absolutely */
  backgroundContent?: ReactNode;
  
  /** Custom classes */
  className?: string; // Section class
  containerClassName?: string; // inner max-w-7xl container class
  titleClassName?: string;
  descriptionClassName?: string;
  
  showDotGrid?: boolean;
}


export const PageHeroSection = ({
  eyebrow,
  title,
  description,
  layout = 'standard',
  ctaContent,
  rightContent,
  bottomContent,
  children,
  backgroundContent,
  className,
  containerClassName,
  titleClassName,
  descriptionClassName,
  showDotGrid = true,
}: PageHeroSectionProps) => {
  const sectionBaseClass = `relative px-4 sm:px-6 pt-16 pb-8 md:flex md:items-center md:-mt-32 ${
    className ?? 'bg-background md:h-[60vh]'
  }`;

  const containerBaseClass = `relative z-10 max-w-7xl mx-auto w-full md:pb-6 ${
    containerClassName ?? 'md:pt-32'
  }`;

  const renderTextContent = (isSplit: boolean) => (
    <>
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="mb-3"
        >
          {typeof eyebrow === 'string' ? (
            <span className="text-xs font-bold tracking-widest text-info uppercase">
              {eyebrow}
            </span>
          ) : (
            eyebrow
          )}
        </motion.div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] mb-4 sm:mb-6 ${
          titleClassName ?? 'text-foreground max-w-3xl'
        }`}
      >
        {title}
      </motion.h1>

      {!isSplit && description && (
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className={`text-base md:text-lg leading-relaxed ${
            descriptionClassName ?? 'text-muted-foreground max-w-2xl'
          }`}
        >
          {description}
        </motion.p>
      )}

      {!isSplit && ctaContent && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="mt-6"
        >
          {ctaContent}
        </motion.div>
      )}
    </>
  );

  return (
    <section className={sectionBaseClass}>
      {backgroundContent}

      <div className={containerBaseClass}>
        {layout === 'standard' && (
          <div className={rightContent ? 'grid lg:grid-cols-2 gap-12 items-center' : ''}>
            <div>{renderTextContent(false)}</div>
            {rightContent && <div className="relative">{rightContent}</div>}
          </div>
        )}

        {layout === 'split-text' && (
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            <div>{renderTextContent(true)}</div>
            <div className="flex flex-col justify-center">
              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className={`text-base md:text-lg leading-relaxed mb-6 ${
                    descriptionClassName ?? 'text-muted-foreground'
                  }`}
                >
                  {description}
                </motion.p>
              )}
              {ctaContent && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
                >
                  {ctaContent}
                </motion.div>
              )}
            </div>
          </div>
        )}


        {(bottomContent || children) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: layout === 'split-text' ? 1.0 : 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
            className={layout === 'split-text' ? '' : 'mt-8'}
          >
            {bottomContent || children}
          </motion.div>
        )}
      </div>

      {showDotGrid && (
        <div className="absolute top-16 right-12 w-32 h-32 opacity-20 hidden sm:block pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {[...Array(25)].map((_, i) => (
              <circle
                key={i}
                cx={(i % 5) * 25 + 12.5}
                cy={Math.floor(i / 5) * 25 + 12.5}
                r="2"
                fill="currentColor"
                className="text-primary"
              />
            ))}
          </svg>
        </div>
      )}
    </section>
  );
};
