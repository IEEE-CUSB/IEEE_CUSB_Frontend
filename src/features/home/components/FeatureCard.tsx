import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  bgPattern?: 'waves1' | 'waves2' | 'waves3';
  variant?: 'main' | 'secondary';
  delay?: number;
  icon?: ReactNode;
  index: number;
  activeIndex: number;
  onExpand: (index: number) => void;
  darkMode?: boolean;
}

/**
 * Auto-expanding flex card with flowing wave backgrounds
 * Shows vertical title when inactive, horizontal when active
 * Colors: IEEE Blue shades only
 */
export const FeatureCard = ({
  title,
  description,
  bgPattern = 'waves1',
  delay = 0,
  icon,
  index,
  activeIndex,
  onExpand,
  darkMode,
}: FeatureCardProps) => {
  const isExpanded = activeIndex === index;

  // Flowing wave backgrounds in IEEE blue shades
  const backgrounds = {
    waves1: (
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: '#00629B', stopOpacity: 1 }}
              />
              <stop
                offset="50%"
                style={{ stopColor: '#0082C8', stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: '#00A0E3', stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q50,80 100,100 T200,100 T300,100 T400,100 L400,400 L0,400 Z"
            fill="url(#grad1)"
            opacity="0.3"
          />
          <path
            d="M-100,150 Q0,120 100,150 T300,150 T500,150 L500,400 L-100,400 Z"
            fill="url(#grad1)"
            opacity="0.2"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-br from-[#004A7C] via-[#00629B] to-[#0082C8]" />
      </div>
    ),
    waves2: (
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: '#0082C8', stopOpacity: 1 }}
              />
              <stop
                offset="50%"
                style={{ stopColor: '#00629B', stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: '#004A7C', stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>
          <path
            d="M0,80 Q100,60 200,80 T400,80 L400,400 L0,400 Z"
            fill="url(#grad2)"
            opacity="0.25"
          />
          <path
            d="M0,140 Q150,110 300,140 T600,140 L600,400 L0,400 Z"
            fill="url(#grad2)"
            opacity="0.15"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-tl from-[#00527D] via-[#00629B] to-[#007AB8]" />
      </div>
    ),
    waves3: (
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop
                offset="0%"
                style={{ stopColor: '#003D5C', stopOpacity: 1 }}
              />
              <stop
                offset="50%"
                style={{ stopColor: '#00629B', stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: '#0090D0', stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>
          <path
            d="M0,120 Q80,90 160,120 T320,120 T480,120 L480,400 L0,400 Z"
            fill="url(#grad3)"
            opacity="0.3"
          />
          <path
            d="M0,180 Q120,150 240,180 T480,180 L480,400 L0,400 Z"
            fill="url(#grad3)"
            opacity="0.2"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#004A7C] via-[#00629B] to-[#00A0E3]" />
      </div>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: delay + 1.2,
        ease: [0.4, 0.0, 0.2, 1],
      }}
      onClick={() => onExpand(index)}
      className={`
        group relative overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer
        ${isExpanded ? 'md:flex-[3]' : 'md:flex-1'}
        ${isExpanded ? 'h-auto min-h-[190px] md:h-[280px]' : 'h-[64px] md:h-[280px]'}
        transition-all duration-500 ease-out
        shadow-md md:shadow-xl ${isExpanded ? 'shadow-xl' : ''}
      `}
    >
      {/* Flowing wave background */}
      {backgrounds[bgPattern]}

      {/* Large background icon - only when expanded */}
      <AnimatePresence>
        {icon && isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-7xl md:text-[200px] text-white pointer-events-none"
          >
            {icon}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with smooth transitions - Fixed positioning */}
      <div className="absolute inset-0 p-4 md:p-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <>
              {/* Inactive card on mobile */}
              <motion.div
                key="inactive-mobile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex md:hidden w-full h-full items-center justify-between px-2 text-white"
              >
                <div className="flex items-center gap-3">
                  {icon && <span className="text-xl opacity-90">{icon}</span>}
                  <span className="text-base font-bold">{title}</span>
                </div>
                <span className="text-[11px] font-semibold opacity-80 bg-white/15 px-2.5 py-1 rounded-full">
                  Tap to view
                </span>
              </motion.div>

              {/* Vertical title when inactive on desktop */}
              <motion.div
                key="vertical-desktop"
                initial={{ opacity: 0, rotateZ: 0 }}
                animate={{ opacity: 1, rotateZ: 0 }}
                exit={{ opacity: 0, rotateZ: 90 }}
                transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
                className="hidden md:flex items-center justify-center"
              >
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-white/70' : 'text-white'}`}
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                  }}
                >
                  {title}
                </motion.h3>
              </motion.div>
            </>
          ) : (
            // Horizontal layout when active
            <motion.div
              key="horizontal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
              className="w-full h-full flex flex-col justify-between py-1 md:py-0"
            >
              <div>
                <div className="flex items-center gap-2 mb-2 md:mb-4">
                  {icon && <span className="text-2xl text-white/90 md:hidden">{icon}</span>}
                  <motion.h3
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="text-xl md:text-2xl font-bold text-white"
                  >
                    {title}
                  </motion.h3>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="text-sm md:text-base text-gray-100 leading-relaxed pr-6 md:pr-0"
                >
                  {description}
                </motion.p>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-3 md:mt-auto origin-left"
              >
                <div className="h-1 bg-white rounded-full w-full" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
