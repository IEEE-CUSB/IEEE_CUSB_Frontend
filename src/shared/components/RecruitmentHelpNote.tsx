import { FaEnvelope } from 'react-icons/fa';

export const RECRUITMENT_SUPPORT_EMAIL = 'it@ieeecusb.org';

const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/IEEECUSB/',
  linkedin: 'https://www.linkedin.com/company/ieeecusb/',
};

const LINK_CLASS =
  'font-semibold text-blue-600 hover:underline dark:text-blue-400';

interface RecruitmentHelpNoteProps {
  isDark: boolean;
}

export const RecruitmentHelpNote = ({ isDark }: RecruitmentHelpNoteProps) => (
  <div
    className={`mt-6 flex items-start gap-3 rounded-xl border p-4 ${
      isDark
        ? 'border-gray-700 bg-gray-900/50 text-gray-300'
        : 'border-gray-200 bg-gray-50 text-gray-600'
    }`}
  >
    <FaEnvelope className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
    <p className="text-sm">
      If you have any problem with the recruitment, please{' '}
      <a
        href={`mailto:${RECRUITMENT_SUPPORT_EMAIL}`}
        className={LINK_CLASS}
      >
        email us at {RECRUITMENT_SUPPORT_EMAIL}
      </a>{' '}
      or contact us on{' '}
      <a
        href={SOCIAL_LINKS.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASS}
      >
        Facebook
      </a>{' '}
      or{' '}
      <a
        href={SOCIAL_LINKS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASS}
      >
        LinkedIn
      </a>
      .
    </p>
  </div>
);
