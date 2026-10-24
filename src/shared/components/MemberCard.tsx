import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { TeamMember } from '@/shared/types/team.types';
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

// ─── Size tokens ─────────────────────────────────────────────────────────────
//
// The outer container always has a FIXED width & height equal to the expanded
// dimensions (+label area). The card animates visually inside that space so
// sibling elements never shift.
//
//   circle     — resting avatar diameter
//   expandedW  — expanded card width  (= container width)
//   expandedH  — expanded card height
//   expandedY  — how far the card moves UP when expanded (visual only)
//   containerH — fixed container height = (expandedH + expandedY offset) + label
//                → bottom of expanded card stays inside the container

export type MemberCardSize = 'sm' | 'md' | 'lg' | 'xs' | '2xs'; // xs is for the mobile-only

const SIZE: Record<
  MemberCardSize,
  {
    circle: number;
    expandedW: number;
    expandedH: number;
    expandedY: number;
    containerH: number; // px — always reserved
    overlayPadding: string;
    nameCls: string;
    roleCls: string;
    nameOverlayCls: string;
    roleOverlayCls: string;
    bioCls: string;
    iconCls: string;
  }
> = {
  sm: {
    circle: 80,
    expandedW: 160,
    expandedH: 210,
    expandedY: -20,
    containerH: 200, // expanded bottom (190) + 10 buffer
    overlayPadding: 'p-4',
    nameCls: 'text-base font-semibold',
    roleCls: 'text-xs',
    nameOverlayCls: 'text-base font-bold',
    roleOverlayCls: 'text-xs',
    bioCls: 'text-xs line-clamp-2',
    iconCls: 'text-base',
  },
  md: {
    circle: 108,
    expandedW: 210,
    expandedH: 270,
    expandedY: -30,
    containerH: 250, // expanded bottom (240) + 10 buffer
    overlayPadding: 'p-5',
    nameCls: 'text-lg font-semibold',
    roleCls: 'text-xs',
    nameOverlayCls: 'text-lg font-bold',
    roleOverlayCls: 'text-xs',
    bioCls: 'text-xs line-clamp-2',
    iconCls: 'text-lg',
  },
  lg: {
    circle: 144,
    expandedW: 260,
    expandedH: 340,
    expandedY: -40,
    containerH: 310, // expanded bottom (300) + 10 buffer
    overlayPadding: 'p-6',
    nameCls: 'text-xl font-semibold',
    roleCls: 'text-sm',
    nameOverlayCls: 'text-xl font-bold',
    roleOverlayCls: 'text-sm',
    bioCls: 'text-sm line-clamp-3',
    iconCls: 'text-xl',
  },
  xs: {
    circle: 64,
    expandedW: 128,
    expandedH: 180,
    expandedY: -10,
    containerH: 170, // expanded bottom (160) + 10 buffer
    overlayPadding: 'p-3',
    nameCls: 'text-sm font-semibold',
    roleCls: 'text-xs',
    nameOverlayCls: 'text-sm font-bold',
    roleOverlayCls: 'text-xs',
    bioCls: 'text-xs line-clamp-2',
    iconCls: 'text-sm',
  },
  '2xs': {
    circle: 48,
    expandedW: 96,
    expandedH: 140,
    expandedY: -5,
    containerH: 130, // expanded bottom (120) + 10 buffer
    overlayPadding: 'p-2',
    nameCls: 'text-xs font-semibold',
    roleCls: 'text-2xs',
    nameOverlayCls: 'text-xs font-bold',
    roleOverlayCls: 'text-2xs',
    bioCls: 'text-2xs line-clamp-2',
    iconCls: 'text-xs',
  },
};

// ─── Props ───────────────────────────────────────────────────────────────────

export interface MemberCardProps {
  member: TeamMember;
  /** Replace the role text shown on the card */
  roleOverride?: string;
  delay?: number;
  /**
   * sm  — compact  (80px circle → 160×210 expanded)
   * md  — medium   (108px circle → 210×270 expanded)
   * lg  — full     (144px circle → 260×340 expanded)  ← default
   * xs  — extra small (64px circle → 128×180 expanded)
   * 2xs — extra extra small (48px circle → 96×140 expanded)
   */
  size?: MemberCardSize;
  /**
   * Skip the scroll-reveal entrance animation.
   * Use inside modals or already-animated containers.
   */
  disableReveal?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const MemberCard = ({
  member,
  roleOverride,
  delay = 0,
  size = 'lg',
  disableReveal = false,
}: MemberCardProps) => {
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const isActive = hovered || tapped;
  const displayRole = roleOverride ?? member.role;
  const s = SIZE[size];

  const linkedinUrl = formatSocialUrl(member.socials?.linkedin);
  const githubUrl = formatSocialUrl(member.socials?.github);
  const twitterUrl = formatSocialUrl(member.socials?.twitter);
  const hasSocials = Boolean(linkedinUrl || githubUrl || twitterUrl);

  // Label slides up and fades out when card expands.
  // The negative y keeps it inside the fixed-height container.
  const labelCollapseY = -(s.expandedH + s.expandedY - s.circle - 16);

  const revealed = disableReveal || isInView;

  return (
    // Fixed-size container — never changes, siblings never shift
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center shrink-0"
      style={{ width: s.expandedW, height: s.containerH }}
      initial={disableReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
    >
      {/* ── Animated card ── */}
      <motion.div
        className="relative z-20 overflow-hidden shadow-xl bg-card cursor-pointer select-none"
        style={{ position: 'absolute', top: 0, left: '50%', x: '-50%' }}
        animate={
          isActive
            ? {
                borderRadius: '16px',
                width: s.expandedW,
                height: s.expandedH,
                y: s.expandedY,
              }
            : {
                borderRadius: '999px',
                width: s.circle,
                height: s.circle,
                y: 0,
              }
        }
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => setTapped(p => !p)}
      >
        <motion.img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover pointer-events-none"
          animate={{ scale: isActive ? 1.1 : 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Overlay with bio + socials */}
        <motion.div
          className={`absolute inset-0 bg-linear-to-t from-primary/95 via-primary/50 to-transparent
                                flex flex-col justify-end ${s.overlayPadding} text-white`}
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{
            delay: isActive ? 0.12 : 0,
            duration: isActive ? 0.5 : 0.15,
          }}
        >
          <h3 className={`${s.nameOverlayCls} text-center leading-tight`}>
            {member.name}
          </h3>
          <p
            className={`${s.roleOverlayCls} text-center font-light mb-1.5 opacity-90`}
          >
            {displayRole}
          </p>

          {/* Bio snippet with tooltip and modal trigger */}
          {member.bio && (
            <div className="w-full text-center my-0.5">
              <p
                className={`${s.bioCls} text-center font-light leading-snug opacity-95 hover:underline cursor-pointer`}
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
            <div
              className={`flex gap-3 justify-center items-center ${s.iconCls} mt-1.5`}
            >
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-white/80 hover:text-[#0077b5] hover:scale-110 transition-all duration-200"
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
                  onClick={e => e.stopPropagation()}
                  className="text-white/80 hover:text-white hover:scale-110 transition-all duration-200"
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
                  onClick={e => e.stopPropagation()}
                  className="text-white/80 hover:text-[#1DA1F2] hover:scale-110 transition-all duration-200"
                  title="Twitter / X"
                >
                  <FaXTwitter />
                </a>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Label (name + role) — sits below circle, slides away on expand ── */}
      <motion.div
        className="absolute text-center pointer-events-none"
        style={{ top: s.circle + 16 }}
        animate={{
          opacity: isActive ? 0 : 1,
          y: isActive ? labelCollapseY : 0,
        }}
        transition={{ duration: 0.25 }}
      >
        <p className={s.nameCls}>{member.name}</p>
        <p className={`text-primary ${s.roleCls}`}>{displayRole}</p>
      </motion.div>

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
                  {displayRole}
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
