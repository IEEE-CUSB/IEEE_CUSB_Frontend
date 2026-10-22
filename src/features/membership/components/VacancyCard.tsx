import { motion } from 'framer-motion';
import { HiBriefcase, HiChevronRight } from 'react-icons/hi';
import { useTheme } from '@/shared/hooks/useTheme';
import { Vacancy } from '@/shared/types/recruitment.types';
import { useNavigate } from 'react-router-dom';
import { stripHtmlToText } from '@/shared/utils/helpers';

const CATEGORY_COLORS: Record<string, string> = {
  Technical: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Marketing: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Media: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  HR: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  Finance: 'bg-green-500/10 text-green-500 border-green-500/20',
  'Event Planning': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  Other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

interface VacancyCardProps {
  vacancy: Vacancy;
  onApply: (vacancy: Vacancy) => void;
  hasApplied?: boolean;
}

export const VacancyCard = ({ vacancy, onApply, hasApplied }: VacancyCardProps) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const categoryName = vacancy.category?.name || 'Other';
  const categoryColor = CATEGORY_COLORS[categoryName] ?? CATEGORY_COLORS.Other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/recruitment/vacancies/${vacancy.id}`)}
      className={`cursor-pointer relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 ${
        isDark
          ? 'bg-gray-800 border-gray-700 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10'
          : 'bg-white border-gray-200 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5'
      }`}
    >
      {/* Image Section */}
      <div className={`relative h-44 overflow-hidden flex-shrink-0 ${
        isDark ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        {vacancy.image_url ? (
          <img
            src={vacancy.image_url}
            alt={vacancy.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <HiBriefcase className="w-8 h-8 text-primary" />
            </div>
          </div>
        )}
        {/* Category badge overlaid on image */}
        {categoryName && categoryName !== 'Other' && (
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${categoryColor}`}>
            {categoryName}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className={`text-lg font-bold mb-2 leading-snug ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {vacancy.title}
        </h3>

        {vacancy.description && (
          <p className={`text-sm line-clamp-3 flex-1 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {stripHtmlToText(vacancy.description)}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          {hasApplied ? (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
              isDark
                ? 'bg-green-900/30 text-green-300 border-green-500/30'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}>
              ✓ Applied
            </span>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onApply(vacancy); }}
              className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-sm shadow-primary/30"
            >
              Apply Now
              <HiChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
