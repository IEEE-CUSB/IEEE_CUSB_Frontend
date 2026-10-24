import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { QUERY_KEYS } from '@/shared/constants/apiConstants';
import * as api from './recruitment.api';
import type {
  AddVacancy,
  ApplyToVacancyRequest,
  ExportApplicationsParams,
  GetAllApplicationsParams,
  UpdateStatus,
  UpdateVacancy,
} from '@/shared/types/recruitment.types';
import { PaginationParams } from '@/shared/types/auth.types';

export const useAddVacancy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: AddVacancy }) => api.addVacancy(data),
    onSuccess: () => {
      toast.success('Vacancy Successfully added!');
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RECRUITMENT.ADMIN_VACANCIES,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RECRUITMENT.VACANCIES,
      });
      queryClient.invalidateQueries({
        queryKey: ['vacancy'],
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Failed to add the vacancy. Please try again.'
      );
    },
  });
};

export const useGetAdminVacancies = (params?: PaginationParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.RECRUITMENT.ADMIN_VACANCIES, params],
    queryFn: () => api.getAdminVacancies(params),
  });
};

export const useUpdateVacancies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVacancy }) =>
      api.updateVacancy(id, data),
    onSuccess: (_, variables) => {
      toast.success('Vacancy updated successfully');
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RECRUITMENT.ADMIN_VACANCIES,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RECRUITMENT.VACANCIES,
      });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: ['vacancy', variables.id],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['vacancy'],
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update vacancy');
    },
  });
};

export const useDeleteVacancy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteVacancy(id),
    onSuccess: () => {
      toast.success('Vacancy deleted successfully');

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RECRUITMENT.ADMIN_VACANCIES,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RECRUITMENT.VACANCIES,
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete vacancy');
    },
  });
};
export const useGetAllApplications = ({
  vacancyId,
  page = 1,
  limit = 10,
  startDate,
  endDate,
  ...params
}: GetAllApplicationsParams) => {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.RECRUITMENT.ADMIN_VACANCY_APPLICATIONS(vacancyId),
      page,
      limit,
      startDate,
      endDate,
      params,
    ],
    queryFn: () =>
      api.getAllApplications({
        vacancyId,
        page,
        limit,
        startDate,
        endDate,
        ...params,
      }),
  });
};

export const useUpdateApplicationStatus = (vacancyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatus }) =>
      api.updateApplicationStatus(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.RECRUITMENT.ADMIN_VACANCY_APPLICATIONS(vacancyId),
      });
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.RECRUITMENT.ADMIN_VACANCY_APPLICATIONS(vacancyId) },
        (oldData: any) => {
          if (!oldData || !oldData.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((app: any) =>
              app.id === id ? { ...app, status: data.status } : app
            ),
          };
        }
      );
    },
    onSuccess: () => {
      toast.success('Application status updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update application status'
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RECRUITMENT.ADMIN_VACANCY_APPLICATIONS(vacancyId),
      });
    },
  });
};

export const useExportApplications = () => {
  return useMutation({
    mutationFn: (params: ExportApplicationsParams) =>
      api.exportApplications(params),

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to export applications'
      );
    },
  });
};

export const useViewApplicationCV = () => {
  return useMutation({
    mutationFn: (applicationId: string) => api.viewApplicationCV(applicationId),

    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to load CV');
    },
  });
};

export const useGetVacancies = (params?: api.GetVacanciesParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.RECRUITMENT.VACANCIES, params],
    queryFn: () => api.getVacancies(params),
  });
};

export const useApplyToVacancy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vacancyId,
      data,
    }: {
      vacancyId: string;
      data: ApplyToVacancyRequest;
    }) => api.applyToVacancy(vacancyId, data),
    onSuccess: () => {
      toast.success('Successfully applied to the vacancy!');
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.USERS.MY_APPLICATIONS,
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Failed to apply to the vacancy. Please try again.'
      );
    },
  });
};

export const useRevokeApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.revokeApplication(id),
    onSuccess: () => {
      toast.success('Application revoked successfully.');
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.USERS.MY_APPLICATIONS,
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Failed to revoke application. Please try again.'
      );
    },
  });
};

export const useUploadVacancyImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      api.uploadVacancyImage(id, file),
    onSuccess: () => {
      toast.success('Image uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECRUITMENT.ADMIN_VACANCIES });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload image');
    },
  });
};

export const useDeleteVacancyImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteVacancyImage(id),
    onSuccess: () => {
      toast.success('Image removed successfully!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECRUITMENT.ADMIN_VACANCIES });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to remove image');
    },
  });
};

export const useVacancyById = (id: string) => {
  return useQuery({
    queryKey: ['vacancy', id],
    queryFn: () => api.getVacancyById(id),
    enabled: !!id,
  });
};
