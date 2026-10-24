import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { IoLogoLinkedin } from 'react-icons/io5';
import { FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Modal } from '@ieee-ui/ui';
import { useTheme } from '@/shared/hooks/useTheme';

const formatSocialUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#') return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export interface BoardMemberCardData {
  name: string;
  role: string;
  bio?: string;
  image: string;
  socials?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

export type BoardMemberCardSize = 'sm' | 'md' | 'lg';

interface BoardMemberCardProps {
  member: BoardMemberCardData;
  size?: BoardMemberCardSize;
  delay?: number;
  disableReveal?: boolean;
}

const SIZE_CONFIG: Record<
  BoardMemberCardSize,
  {
    avatar: string;
    name: string;
    role: string;
    bio: string;
    icon: string;
    card: string;
    padding: string;
  }
> = {
  sm: {
    avatar: 'w-14 h-14',
    name: 'text-sm font-bold',
    role: 'text-xs',
    bio: 'text-xs',
    icon: 'text-sm',
    card: 'w-36',
    padding: 'p-3',
  },
  md: {
    avatar: 'w-[72px] h-[72px]',
    name: 'text-base font-bold',
    role: 'text-xs',
    bio: 'text-xs',
    icon: 'text-sm',
    card: 'w-44',
    padding: 'p-4',
  },
  lg: {
    avatar: 'w-24 h-24',
    name: 'text-lg font-bold',
    role: 'text-sm',
    bio: 'text-xs',
    icon: 'text-base',
    card: 'w-52',
    padding: 'p-5',
  },
};

export const BoardMemberCard = ({
  member,
  size = 'md',
  delay = 0,
  disableReveal = false,
}: BoardMemberCardProps) => {
  const { isDark } = useTheme();
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const revealed = disableReveal || isInView;
  const s = SIZE_CONFIG[size];

  const linkedinUrl = formatSocialUrl(member.socials?.linkedin);
  const githubUrl = formatSocialUrl(member.socials?.github);
  const twitterUrl = formatSocialUrl(member.socials?.twitter);
  const hasSocials = Boolean(linkedinUrl || githubUrl || twitterUrl);

  return (
    <motion.div
      ref={ref}
      className={`group relative flex flex-col items-center rounded-2xl bg-card border border-border shadow-sm
        hover:shadow-xl hover:border-primary/40
        transition-all duration-300 cursor-default ${s.card} ${s.padding}`}
      style={{ willChange: 'transform' }}
      initial={disableReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {/* Avatar */}
      <div className="relative mb-3 shrink-0">
        <div
          className={`${s.avatar} rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300 shrink-0`}
        >
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Name & Role */}
      <div className="text-center w-full">
        <p className={`${s.name} text-foreground leading-tight`}>
          {member.name}
        </p>
        <p className={`${s.role} text-primary mt-0.5 font-medium`}>
          {member.role}
        </p>
      </div>

      {/* Bio snippet with tooltip and modal trigger */}
      {member.bio && (
        <div className="w-full text-center mt-2">
          <p
            className={`${s.bio} text-muted-foreground text-center line-clamp-2 leading-relaxed cursor-pointer hover:text-foreground transition-colors`}
            title={member.bio}
            onClick={e => {
              e.stopPropagation();
              setIsBioModalOpen(true);
            }}
          >
            {member.bio}
          </p>
        </div>
      )}

      {/* Social icons */}
      {hasSocials && (
        <div className={`flex items-center gap-2.5 mt-3 ${s.icon}`}>
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#0077b5] hover:scale-110 transition-all duration-200"
              title="LinkedIn"
              onClick={e => e.stopPropagation()}
            >
              <IoLogoLinkedin />
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
              title="GitHub"
              onClick={e => e.stopPropagation()}
            >
              <FaGithub />
            </a>
          )}
          {twitterUrl && (
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#1DA1F2] hover:scale-110 transition-all duration-200"
              title="Twitter / X"
              onClick={e => e.stopPropagation()}
            >
              <FaXTwitter />
            </a>
          )}
        </div>
      )}

      {/* ── Bio Modal ── */}
      {member.bio && (
        <Modal
          isOpen={isBioModalOpen}
          onClose={() => setIsBioModalOpen(false)}
          title={member.name}
          size="medium"
          darkMode={isDark}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={member.image}
                alt={member.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4
                  className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {member.name}
                </h4>
                <p className="text-sm font-medium text-primary">
                  {member.role}
                </p>
                {hasSocials && (
                  <div className="flex items-center gap-3 mt-2 text-base">
                    {linkedinUrl && (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-[#0077b5] transition-colors"
                        title="LinkedIn"
                      >
                        <IoLogoLinkedin />
                      </a>
                    )}
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                        title="GitHub"
                      >
                        <FaGithub />
                      </a>
                    )}
                    {twitterUrl && (
                      <a
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-[#1DA1F2] transition-colors"
                        title="Twitter / X"
                      >
                        <FaXTwitter />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/60 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
            >
              <h5
                className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                About / Bio
              </h5>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {member.bio}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};
