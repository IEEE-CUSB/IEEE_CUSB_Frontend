import { useParams, useNavigate } from 'react-router-dom';
import { useVacancyById } from '@/shared/queries/recruitment/recruitment.queries';
import { useTheme } from '@/shared/hooks/useTheme';
import { HiBriefcase, HiArrowLeft } from 'react-icons/hi';
import { Button } from '@ieee-ui/ui';
import { Loader } from '@ieee-ui/ui';
import { motion } from 'framer-motion';
import { VacancyApplicationForm } from '@/features/membership/components/VacancyApplicationForm';
import { useAppSelector } from '@/shared/store/hooks';
import { useGetUserApplications } from '@/shared/queries/users/users.queries';
import { Application } from '@/shared/types/recruitment.types';
import { getSocietyBadgeStyle } from '@/shared/utils/helpers';

export const VacancyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const { data: vacancy, isLoading, error } = useVacancyById(id!);
  
  // Need to check if user has already applied
  const { data: myApplicationsData } = useGetUserApplications();
  const hasApplied = isAuthenticated && myApplicationsData?.vacancyApplications?.some((app: Application) => app.vacancy_id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader size="large" />
      </div>
    );
  }

  if (error || !vacancy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Vacancy Not Found</h2>
        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>The vacancy you are looking for does not exist or has been closed.</p>
        <Button buttonText="Back to Vacancies" onClick={() => navigate('/join')} type="primary" darkMode={isDark} />
      </div>
    );
  }

  const categoryName = vacancy.category?.name || 'Other';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen mt-24">
      <button 
        onClick={() => navigate('/join')}
        className={`flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
      >
        <HiArrowLeft className="w-4 h-4" /> Back to Vacancies
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border shadow-lg ${isDark ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' : 'bg-white border-gray-200 shadow-gray-200/50'}`}
      >
        {/* Header Image */}
        <div className={`w-full h-64 md:h-80 relative flex-shrink-0 rounded-t-2xl overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          {vacancy.image_url ? (
            <img src={vacancy.image_url} alt={vacancy.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
                <HiBriefcase className="w-12 h-12 text-primary" />
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6 md:p-10">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                  {categoryName}
                </span>
                {vacancy.society && (
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full backdrop-blur-md border ${getSocietyBadgeStyle(vacancy.society, true)}`}>
                    {vacancy.society}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{vacancy.title}</h1>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left side: Description */}
            <div className="flex-1 w-full min-w-0">
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Role Description</h2>
              {vacancy.description ? (
                <div
                  className={`prose prose-sm md:prose-base max-w-none break-words ${isDark ? 'prose-invert text-gray-300' : 'text-gray-600'}`}
                  dangerouslySetInnerHTML={{ __html: vacancy.description.replace(/&nbsp;/g, ' ') }}
                />
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No description provided.</p>
              )}
            </div>

            {/* Right side: Apply Form (embedded) */}
            <div className="w-full lg:w-[400px] flex-shrink-0">
              <div className={`sticky top-24 p-6 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Apply for this Role</h2>
                <VacancyApplicationForm
                  vacancy={vacancy}
                  isDark={isDark}
                  hasApplied={hasApplied}
                  onSuccess={() => navigate('/join')}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
