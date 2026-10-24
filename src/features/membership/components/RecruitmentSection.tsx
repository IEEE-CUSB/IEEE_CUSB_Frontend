import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiBriefcase,
  HiOutlineTrash,
  HiCheckCircle,
  HiXCircle,
  HiOutlineClock,
} from 'react-icons/hi';
import { Loader } from '@ieee-ui/ui';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAppSelector } from '@/shared/store/hooks';
import {
  useGetVacancies,
  useRevokeApplication,
} from '@/shared/queries/recruitment';
import { useGetUserApplications } from '@/shared/queries/users/users.queries';
import { useGetCategories } from '@/shared/queries/categories/categories.queries';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal';
import { VacancyCard } from './VacancyCard';
import { VacancyApplyModal } from './VacancyApplyModal';
import {
  Vacancy,
  Application,
  Society,
  SOCIETIES,
} from '@/shared/types/recruitment.types';
import { CategoryType } from '@/shared/types/category.types';
import { useDebounce } from '@/shared/hooks/useDebounce';

const CATEGORY_ALL = 'All';
const SOCIETY_ALL = 'All';

export const RecruitmentSection = () => {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Search + filter state
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [activeCategoryId, setActiveCategoryId] =
    useState<string>(CATEGORY_ALL);
  const [activeSociety, setActiveSociety] = useState<string>(SOCIETY_ALL);

  // Apply modal state
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Revoke modal state
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [selectedApplicationVacancyTitle, setSelectedApplicationVacancyTitle] =
    useState('');

  // Data
  const { data: categoriesPayload } = useGetCategories({
    type: CategoryType.RECRUITMENT,
    limit: 100,
  });
  const categories = categoriesPayload?.categories || [];

  const { data: vacanciesData = [], isLoading: isLoadingVacancies } =
    useGetVacancies({
      search: debouncedSearch,
      ...(activeCategoryId !== CATEGORY_ALL
        ? { category_id: activeCategoryId }
        : {}),
      ...(activeSociety !== SOCIETY_ALL
        ? { society: activeSociety as Society }
        : {}),
    } as any);
  const { data: myApplicationsData, isLoading: isLoadingMyApps } =
    useGetUserApplications();
  const myApplications: Application[] =
    myApplicationsData?.vacancyApplications || [];
  const revokeMutation = useRevokeApplication();

  const openVacancies = (vacanciesData as Vacancy[]).filter(v => v.is_open);
  const appliedVacancyIds = new Set(
    myApplications.map((a: Application) => a.vacancy_id)
  );

  const handleApplyClick = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setIsApplyModalOpen(true);
  };

  const handleRevokeClick = (applicationId: string, vacancyTitle: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedApplicationVacancyTitle(vacancyTitle);
    setIsRevokeModalOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!selectedApplicationId) return;
    await revokeMutation.mutateAsync(selectedApplicationId);
    setIsRevokeModalOpen(false);
    setSelectedApplicationId(null);
    setSelectedApplicationVacancyTitle('');
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'REJECTED':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return <HiCheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <HiXCircle className="w-4 h-4" />;
      default:
        return <HiOutlineClock className="w-4 h-4" />;
    }
  };

  return (
    <section
      className={`py-16 md:py-24 px-6 ${isDark ? 'bg-gray-900' : 'bg-background'}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HiBriefcase className="w-7 h-7 text-primary" />
          </div>
          <h2
            className={`text-3xl md:text-4xl font-bold mb-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Open Positions
          </h2>
          <p
            className={`text-base max-w-xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Explore available roles and find your fit in our IEEE CUSB family.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Vacancies Grid */}
          <div className="flex-1">
            {/* Search + Category & Society Filters */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`flex flex-col gap-4 mb-8 p-4 rounded-xl shadow-sm transition-all duration-300 ${
                isDark
                  ? 'bg-gray-800 shadow-blue-900/5'
                  : 'bg-white shadow-gray-100'
              }`}
            >
              {/* Search Bar Row */}
              <div>
                <div className="relative ">
                  <input
                    type="text"
                    placeholder="Search positions..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={`w-full px-4 py-2 pl-10 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 ${
                      isDark
                        ? 'bg-gray-700/50 text-white placeholder-gray-500'
                        : 'bg-gray-50 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                        isDark
                          ? 'text-gray-500 hover:text-gray-300'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`flex flex-col gap-4 mb-8 p-4 rounded-xl shadow-sm transition-all duration-300 ${
                isDark
                  ? 'bg-gray-800 shadow-blue-900/5'
                  : 'bg-white shadow-gray-100'
              }`}
            >
              {/* Category Filter Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  } sm:w-20 shrink-0`}
                >
                  Category:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 no-scrollbar">
                  <motion.button
                    onClick={() => setActiveCategoryId(CATEGORY_ALL)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeCategoryId === CATEGORY_ALL
                        ? 'bg-primary text-white shadow-sm shadow-primary/25'
                        : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </motion.button>
                  {categories.map(cat => (
                    <motion.button
                      key={cat.id}
                      onClick={() => setActiveCategoryId(cat.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        activeCategoryId === cat.id
                          ? 'bg-primary text-white shadow-sm shadow-primary/25'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Society Filter Row */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t ${
                  isDark ? 'border-gray-700/60' : 'border-gray-100'
                }`}
              >
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  } sm:w-20 shrink-0`}
                >
                  Society:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 no-scrollbar">
                  {[SOCIETY_ALL, ...SOCIETIES].map(soc => {
                    const isActive = activeSociety === soc;
                    return (
                      <motion.button
                        key={soc}
                        onClick={() => setActiveSociety(soc)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-primary text-white shadow-sm shadow-primary/25'
                            : isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {soc}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Vacancy Grid */}
            {isLoadingVacancies ? (
              <div className="flex justify-center py-20">
                <Loader size="large" />
              </div>
            ) : openVacancies.length === 0 ? (
              <div
                className={`flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed ${
                  isDark
                    ? 'border-gray-700 text-gray-500'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                <HiBriefcase className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">
                  {search ||
                  activeCategoryId !== CATEGORY_ALL ||
                  activeSociety !== SOCIETY_ALL
                    ? 'No positions match your filters.'
                    : 'No open positions at the moment.'}
                </p>
                {(search ||
                  activeCategoryId !== CATEGORY_ALL ||
                  activeSociety !== SOCIETY_ALL) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setActiveCategoryId(CATEGORY_ALL);
                      setActiveSociety(SOCIETY_ALL);
                    }}
                    className="mt-3 text-xs text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {openVacancies.map((vacancy: Vacancy) => (
                  <VacancyCard
                    key={vacancy.id}
                    vacancy={vacancy}
                    onApply={handleApplyClick}
                    hasApplied={appliedVacancyIds.has(vacancy.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: My Applications — only show when authenticated */}
          {isAuthenticated && (
            <div className="lg:w-80 flex-shrink-0">
              <div
                className={`sticky top-6 p-5 rounded-2xl border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200 shadow-md'
                }`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  My Applications
                </h3>

                {isLoadingMyApps ? (
                  <div className="flex justify-center py-8">
                    <Loader size="medium" />
                  </div>
                ) : myApplications.length === 0 ? (
                  <div
                    className={`text-center py-8 rounded-xl border border-dashed ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <p
                      className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      You haven't applied yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    <AnimatePresence>
                      {myApplications.map((app: Application) => {
                        const vacancy = (vacanciesData as Vacancy[]).find(
                          v => v.id === app.vacancy_id
                        );
                        return (
                          <motion.div
                            key={app.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isDark
                                ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <h4
                                className={`font-semibold text-sm pr-4 ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}
                              >
                                {vacancy?.title || 'Unknown Role'}
                              </h4>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(
                                  app.status
                                )}`}
                              >
                                {getStatusIcon(app.status)} {app.status}
                              </span>
                            </div>
                            {(() => {
                              const firstAnswerKey = Object.keys(
                                app.extra_data || {}
                              )[0];
                              const firstAnswer = firstAnswerKey
                                ? app.extra_data[firstAnswerKey]
                                : null;
                              const firstQuestionText =
                                vacancy?.questions?.find(
                                  q => q.id === firstAnswerKey
                                )?.question_text;
                              return firstAnswerKey &&
                                firstAnswer &&
                                typeof firstAnswer === 'string' ? (
                                <p
                                  className={`text-xs mb-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                                >
                                  {firstQuestionText && (
                                    <span className="font-medium">
                                      {firstQuestionText}:{' '}
                                    </span>
                                  )}
                                  {firstAnswer}
                                </p>
                              ) : null;
                            })()}
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                              >
                                {new Date(app.created_at).toLocaleDateString()}
                              </span>
                              {app.status === 'PENDING' && (
                                <button
                                  onClick={() =>
                                    handleRevokeClick(
                                      app.id,
                                      vacancy?.title || 'this vacancy'
                                    )
                                  }
                                  disabled={revokeMutation.isPending}
                                  className={`text-[10px] font-medium flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                                    isDark
                                      ? 'text-red-400 hover:bg-red-500/20'
                                      : 'text-red-600 hover:bg-red-50'
                                  } disabled:opacity-50`}
                                >
                                  <HiOutlineTrash className="w-3 h-3" /> Revoke
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <VacancyApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedVacancy(null);
        }}
        vacancy={selectedVacancy}
        hasApplied={
          selectedVacancy ? appliedVacancyIds.has(selectedVacancy.id) : false
        }
      />

      {/* Revoke Confirm Modal */}
      <ConfirmDeleteModal
        isOpen={isRevokeModalOpen}
        onClose={() => {
          setIsRevokeModalOpen(false);
          setSelectedApplicationId(null);
          setSelectedApplicationVacancyTitle('');
        }}
        onConfirm={handleConfirmRevoke}
        title="Revoke Application"
        itemName={selectedApplicationVacancyTitle}
        entityLabel="application"
        isDark={isDark}
        isPending={revokeMutation.isPending}
      />
    </section>
  );
};
