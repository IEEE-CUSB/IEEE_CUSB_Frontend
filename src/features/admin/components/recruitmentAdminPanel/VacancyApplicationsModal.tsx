import { useState, useMemo } from 'react';
import {
  Modal,
  type ColumnDef,
  Button,
  ErrorScreen,
  DataTable,
  DatePicker,
} from '@ieee-ui/ui';

import { FaUser } from 'react-icons/fa';
import { useTheme } from '@/shared/hooks/useTheme';
import { MobileVacancyApplicationsCard } from './MobileVacancyApplicationsCard';
import {
  Application,
  ApplicationStatus,
} from '@/shared/types/recruitment.types';
import { useGetAllApplications, useUpdateApplicationStatus } from '@/shared/queries/recruitment/recruitment.queries';
import { useDebounce } from '@/shared/hooks/useDebounce';
import UniversityList from '@/constants/universityList';

import UserInfo from '../shared/UserInfo';

type ApplicationFilter = 'ALL' | ApplicationStatus;

interface VacancyApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancyId: string;
  vacancyTitle: string;
}

export const VacancyApplicationsModal = ({
  isOpen,
  onClose,
  vacancyId,
  vacancyTitle,
}: VacancyApplicationsModalProps) => {
  const { isDark } = useTheme();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeApps, setActiveApps] = useState<ApplicationFilter>('ALL');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const searchType = filterValues.searchBy || 'name';

  const { data, isLoading, isError } = useGetAllApplications({
    vacancyId,
    page,
    limit,
    search: searchType === 'name' ? debouncedSearch : undefined,
    username: searchType === 'username' ? debouncedSearch : undefined,
    email: searchType === 'email' ? debouncedSearch : undefined,
    university: filterValues.university || undefined,
    /////// to be implemented later for filtering by date range
    // startDate: startDate || undefined,
    // endDate: endDate || undefined,
  });

  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateApplicationStatus(vacancyId);
  const applications = data?.data || [];
  const totalPages = data?.totalPages || 1;

  // Filtered applications (in-memory filtering for current page)
  const dateFilteredApplications = useMemo(() => {
    return !startDate && !endDate
      ? applications
        : applications.filter((app: Application) => {
          // Date filter
          const applicationDate = new Date(app.created_at);

          const matchesStart =
            !startDate || applicationDate >= new Date(startDate);

          const matchesEnd = !endDate || applicationDate <= new Date(endDate);

          const searchLower = debouncedSearch.toLowerCase();
          const matchesSearch = !searchLower || 
            (app.user?.name?.toLowerCase().includes(searchLower)) ||
            (app.user?.email?.toLowerCase().includes(searchLower)) ||
            (app.user_id.toLowerCase().includes(searchLower));

          return matchesStart && matchesEnd && matchesSearch;
        });
  }, [applications, startDate, endDate, debouncedSearch]);

  // Transform and filter applications based on the active filter
  const getFilteredApplications = () => {
    if (activeApps === 'ALL') return dateFilteredApplications;
    return dateFilteredApplications.filter((app: Application) => app.status === activeApps);
  };

  const filteredApplications = getFilteredApplications();

  const handleUpdateStatus = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    await updateStatus({
      id: applicationId,
      data: { status },
    });
  };

  const [selectedApplication, setSelectedApplication] = useState<Application>(
    {} as Application
  );
  // const [selectedExtraDetails, setSelectedExtraDetails] = useState<
  //   Application['extra_data']
  // >({} as Application['extra_data']);

  const handleUserInfoClick = (application: Application) => {
    setSelectedApplication(application);
    setMenuOpen(true);
  };

  const columns = useMemo<ColumnDef<Application>[]>(
    () => [
      {
        header: 'Applicant',
        cell: item => (
          <div className="flex flex-col min-w-0 max-w-[240px]">
            <span
              className={`font-medium truncate ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              title={item.user?.name || 'Unknown User'}
            >
              {item.user?.name || 'Unknown User'}
            </span>
            <span
              className={`text-xs truncate ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
              title={item.user?.email || item.user_id}
            >
              {item.user?.email || item.user_id}
            </span>
          </div>
        ),
      },
      {
        header: 'Applied on',
        cell: item => (
          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },
      {
        header: 'Status',
        cell: item => {
          const statusColors: Record<ApplicationStatus, string> = {
            [ApplicationStatus.ACCEPTED]: isDark
              ? 'bg-green-900/30 text-green-300'
              : 'bg-green-50 text-green-700',
            [ApplicationStatus.REJECTED]: isDark
              ? 'bg-red-900/30 text-red-300'
              : 'bg-red-50 text-red-700',
            [ApplicationStatus.PENDING]: isDark
              ? 'bg-gray-800 text-gray-300'
              : 'bg-gray-100 text-gray-700',
          };

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                statusColors[item.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {item.status}
            </span>
          );
        },
      },
      {
        header: 'Actions',
        className: 'text-right',
        cell: item => (
          <div className="flex justify-end gap-2">
            {item.status !== ApplicationStatus.ACCEPTED && (
              <Button
                buttonText="Accept"
                onClick={() =>
                  handleUpdateStatus(item.id, ApplicationStatus.ACCEPTED)
                }
                disabled={isUpdating}
                className="text-xs px-2 py-1"
                width="fit"
                darkMode={isDark}
                type="primary"
              />
            )}
            {item.status !== ApplicationStatus.REJECTED && (
              <Button
                buttonText="Reject"
                onClick={() =>
                  handleUpdateStatus(item.id, ApplicationStatus.REJECTED)
                }
                disabled={isUpdating}
                className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                width="fit"
                darkMode={isDark}
                type="basic"
              />
            )}
            <button
              onClick={() => handleUserInfoClick(item)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-400/10'
                  : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
              }`}
              title="User Info"
            >
              <FaUser className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [isDark, isUpdating]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vacancy Applications: ${vacancyTitle}`}
      size="full"
      darkMode={isDark}
    >
      <div className="space-y-4">
        {isError ? (
          <ErrorScreen
            title="Failed to load applications"
            message="Please try again later."
            className="h-64"
            darkMode={isDark}
          />
        ) : (
          <>
            <UserInfo
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              User={selectedApplication.user}
              extraDetails={selectedApplication.extra_data}
            />

            <DataTable
              data={filteredApplications}
              columns={columns}
              darkMode={isDark}
              emptyMessage="No applications found"
              isLoading={isLoading}
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder={`Search by ${filterValues.searchBy || 'name'}...`}
              filters={[
                {
                  key: 'searchBy',
                  label: 'Search Field',
                  placeholder: 'Search By',
                  options: [
                    { label: 'Name', value: 'name' },
                    { label: 'Username', value: 'username' },
                    { label: 'Email', value: 'email' },
                  ],
                },
                {
                  key: 'university',
                  label: 'University',
                  placeholder: 'All Universities',
                  options: UniversityList.map(u => ({
                    label: u,
                    value: u,
                  })),
                },
                {
                  key: 'status',
                  label: 'Status',
                  placeholder: 'All Statuses',
                  options: [
                    { label: 'Pending', value: 'PENDING' },
                    { label: 'Accepted', value: 'ACCEPTED' },
                    { label: 'Rejected', value: 'REJECTED' },
                  ],
                },
              ]}
              filterValues={{ ...filterValues, status: activeApps === 'ALL' ? '' : activeApps }}
              onFilterChange={(key, value) => {
                if (key === 'status') {
                  setActiveApps((value as ApplicationFilter) || 'ALL');
                } else {
                  setFilterValues(prev => ({ ...prev, [key]: value }));
                }
              }}
              onClearFilters={() => {
                setActiveApps('ALL');
                setFilterValues({});
                setStartDate('');
                setEndDate('');
                setSearch('');
              }}
              customFilters={
                <>
                  <div className="w-[140px]">
                    <DatePicker
                      id="startDate"
                      value={startDate}
                      onChange={setStartDate}
                      darkMode={isDark}
                    />
                  </div>
                  <div className="w-[140px]">
                    <DatePicker
                      id="endDate"
                      value={endDate}
                      onChange={setEndDate}
                      darkMode={isDark}
                    />
                  </div>
                </>
              }
              renderMobileCard={app => (
                <MobileVacancyApplicationsCard
                  application={app}
                  isDark={isDark}
                  isUpdating={isUpdating}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </Modal>
  );
};
