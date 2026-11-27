import { FaWhatsapp } from 'react-icons/fa';

export const RECRUITMENT_SUPPORT_WHATSAPP_URL =
  'https://wa.me/201552851443';

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
    <FaWhatsapp className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
    <p className="text-sm">
      If you have any problem with the recruitment, please{' '}
      <a
        href={RECRUITMENT_SUPPORT_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-green-600 hover:underline dark:text-green-400"
      >
        contact us on WhatsApp
      </a>
      .
    </p>
  </div>
);
