import { useMemo, useState, useEffect } from 'react';
import { type ColumnDef } from '@ieee-ui/ui';
import { FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { CgWorkAlt } from 'react-icons/cg';
import { useTheme } from '@/shared/hooks/useTheme';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal';
import { AdminMobileCard } from '@/shared/components/AdminMobileCard';
import { DataTable } from '@ieee-ui/ui';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  AddVacancy,
  UpdateVacancy,
  Vacancy,
} from '@/shared/types/recruitment.types';
import {
  useAddVacancy,
  useDeleteVacancy,
  useGetAdminVacancies,
  useUpdateVacancies,
} from '@/shared/queries/recruitment';
import { AddEditVacancyModal } from './AddEditVacancyModal';
import { VacancyApplicationsModal } from './VacancyApplicationsModal';
import { stripHtmlToText } from '@/shared/utils/helpers';

const VacanciesTab = () => {
  const { isDark } = useTheme();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Queries & Mutations
  const { data, isLoading } = useGetAdminVacancies({ page, limit, search: debouncedSearch });
  const vacancies = data?.vacancies || [];
  
  const createMutation = useAddVacancy();
  const updateMutation = useUpdateVacancies();
  const deleteMutation = useDeleteVacancy();

  // State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | undefined>(
    undefined
  );
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const [selectedVacancyForApplications, setSelectedVacancyForApplications] =
    useState<Vacancy | undefined>(undefined);

  // Handlers
  const handleAdd = () => {
    setSelectedVacancy(undefined);
    setIsAddEditOpen(true);
  };

  const handleEdit = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setIsAddEditOpen(true);
  };

  const handleDeleteClick = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setIsDeleteOpen(true);
  };

  const handleViewApplications = (vacancy: Vacancy) => {
    setSelectedVacancyForApplications(vacancy);
    setIsApplicationsModalOpen(true);
  };

  const handleSave = async (data: AddVacancy | UpdateVacancy, id?: string): Promise<string | undefined> => {
    if (id) {
      await updateMutation.mutateAsync({ id, data });
      return id;
    } else {
      const newV = await createMutation.mutateAsync({
        data: data as AddVacancy,
      });
      return newV.id;
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedVacancy) {
      await deleteMutation.mutateAsync(selectedVacancy.id);
      setIsDeleteOpen(false);
      setSelectedVacancy(undefined);
    }
  };

  const columns = useMemo<ColumnDef<Vacancy>[]>(
    () => [
      {
        header: 'Vacancy Title',
        accessorKey: 'title',
        cell: item => (
          <div className="flex items-center gap-3">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}>
                <CgWorkAlt className={`w-4 h-4 ${isDark ? 'text-primary-light' : 'text-primary'}`} />
              </div>
            )}
            <span className={`font-medium max-w-[180px] truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {item.title}
            </span>
          </div>
        ),
      },
      {
        header: 'Category',
        accessorKey: 'category',
        cell: item => (
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {typeof item.category === "string" ? item.category : (item.category?.name ?? "—")}
          </span>
        ),
      },
      {
        header: 'Created at',
        accessorKey: 'created_at',
        cell: item => (
          <span
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            {new Date(item.created_at).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },

      {
        header: 'Last Updated',
        accessorKey: 'updated_at',
        cell: item => (
          <span
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            {new Date(item.updated_at).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'is_open',
        cell: item => {
          let statusText = 'Open';
          let statusColor = isDark
            ? 'bg-green-900/30 text-green-300'
            : 'bg-green-50 text-green-600';

          if (!item.is_open) {
            statusText = 'Closed';
            statusColor = isDark
              ? 'bg-gray-800 text-gray-300'
              : 'bg-gray-100 text-gray-600';
          }

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
            >
              {statusText}
            </span>
          );
        },
      },
      {
        header: 'Actions',
        className: 'text-right',
        cell: item => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleEdit(item)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-500 hover:text-primary hover:bg-primary/10'
                  : 'text-gray-400 hover:text-primary hover:bg-primary/5'
              }`}
              title="Edit Vacancy"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewApplications(item)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-400/10'
                  : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
              }`}
              title="View Applications"
            >
              <FiUsers className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteClick(item)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-500 hover:text-red-400 hover:bg-red-400/10'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
              title="Delete Vacancy"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [isDark]
  );
  return (
    <div className="space-y-6">
      <DataTable
        title="Vacancies Management"
        subtitle="Manage vacancies, opportunities and applications."
        headerIcon={<CgWorkAlt className="w-5 h-5 text-primary" />}
        headerAction={
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-md shadow-primary/20 flex-shrink-0"
          >
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path fill="none" d="M0 0h24v24H0V0z" />
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Add Vacancy
          </button>
        }
        data={vacancies}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title or description..."
        emptyMessage="No vacancies found. Click 'Add Vacancy' to create one."
        darkMode={isDark}
        page={page}
        totalPages={data?.totalPages}
        totalCount={data?.count}
        onPageChange={setPage}
        renderMobileCard={vacancy => {
          const badgeText = vacancy.is_open ? 'Open' : 'Closed';
          return (
            <AdminMobileCard
              isDark={isDark}
              title={vacancy.title}
              subtitle={`${new Date(vacancy.created_at).toLocaleString(
                undefined,
                {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )} · last updated ${new Date(vacancy.updated_at).toLocaleString(
                undefined,
                {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}`}
              badge={badgeText}
              description={vacancy.description ? stripHtmlToText(vacancy.description) : undefined}
              avatar={
                vacancy.image_url ? (
                  <img
                    src={vacancy.image_url}
                    alt={vacancy.title}
                    className="flex-shrink-0 w-10 h-10 rounded-xl object-cover"
                  />
                ) : (
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}
                  >
                    <CgWorkAlt
                      className={`w-5 h-5 ${isDark ? 'text-primary-light' : 'text-primary'}`}
                    />
                  </div>
                )
              }
              onEdit={() => handleEdit(vacancy)}
              onDelete={() => handleDeleteClick(vacancy)}
              extraActions={[
                {
                  icon: <FiUsers className="w-3.5 h-3.5" />,
                  label: 'Applications',
                  onClick: () => handleViewApplications(vacancy),
                  color: 'info',
                },
              ]}
            />
          );
        }}
      />

      <AddEditVacancyModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        vacancy={selectedVacancy}
        apiVacancy={selectedVacancy}
        onSave={handleSave}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Vacancy"
        itemName={selectedVacancy?.title || ''}
        entityLabel="vacancy"
        isDark={isDark}
        isPending={deleteMutation.isPending}
      />

      {isApplicationsModalOpen && selectedVacancyForApplications && (
        <VacancyApplicationsModal
          isOpen={isApplicationsModalOpen}
          onClose={() => {
            setIsApplicationsModalOpen(false);
            setSelectedVacancyForApplications(undefined);
          }}
          vacancyId={selectedVacancyForApplications.id}
          vacancyTitle={selectedVacancyForApplications.title}
        />
      )}
    </div>
  );
};

export default VacanciesTab;
