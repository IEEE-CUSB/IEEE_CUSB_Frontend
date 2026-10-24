import { apiClient } from '@/shared/config/api.config';
import { API_ENDPOINTS } from '@/shared/constants/apiConstants';
import type {
  Vacancy,
  Application,
  ApplyToVacancyRequest,
  ApiResponse,
  AddVacancy,
  UpdateVacancy,
  GetAllApplicationsParams,
  UpdateStatus,
  ExportApplicationsParams,
  Society,
} from '@/shared/types/recruitment.types';
import {
  PaginationParams,
  BackendPaginatedResponse,
  PaginatedPayload,
} from '@/shared/types/auth.types';

export const addVacancy = async (data: AddVacancy): Promise<Vacancy> => {
  const response = await apiClient.post<ApiResponse<Vacancy>>(
    API_ENDPOINTS.RECRUITMENT.CREATE,
    data
  );
  return response.data.data;
};

export const getAdminVacancies = async (
  params?: PaginationParams
): Promise<PaginatedPayload<Vacancy, 'vacancies'>> => {
  const filteredParams = params
    ? Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)])
      )
    : undefined;

  const response = await apiClient.get<
    BackendPaginatedResponse<Vacancy, 'vacancies'>
  >(API_ENDPOINTS.RECRUITMENT.GET_ALL_VACANCIES, { params: filteredParams });
  return response.data.data;
};

export const updateVacancy = async (
  vacancyId: string,
  data: UpdateVacancy
): Promise<Vacancy> => {
  const response = await apiClient.patch<ApiResponse<Vacancy>>(
    API_ENDPOINTS.RECRUITMENT.UPDATE_VACANCY(vacancyId),
    data
  );
  return response.data.data;
};

export const deleteVacancy = async (vacancyId: string): Promise<void> => {
  await apiClient.delete<ApiResponse<Vacancy>>(
    API_ENDPOINTS.RECRUITMENT.DELETE_VACANCY(vacancyId)
  );
};

export const getAllApplications = async ({
  vacancyId,
  startDate,
  endDate,
  page = 1,
  limit = 100,
  ...rest
}: GetAllApplicationsParams): Promise<
  PaginatedPayload<Application, 'data'>
> => {
  const response = await apiClient.get<
    BackendPaginatedResponse<Application, 'data'>
  >(API_ENDPOINTS.RECRUITMENT.GET_ALL_APPLICATIONS(vacancyId), {
    params: {
      startDate,
      endDate,
      page,
      limit,
      ...rest,
    },
  });
  return response.data.data;
};

export const updateApplicationStatus = async (
  applicationId: string,
  data: UpdateStatus
): Promise<Application> => {
  const response = await apiClient.patch<ApiResponse<Application>>(
    API_ENDPOINTS.RECRUITMENT.UPDATE_APPLICATION_STATUS(applicationId),
    data
  );
  return response.data.data;
};

export const exportApplications = async ({
  vacancyId,
  startDate,
  endDate,
}: ExportApplicationsParams): Promise<Blob> => {
  const response = await apiClient.get<Blob>(
    API_ENDPOINTS.RECRUITMENT.EXPORT_APPLICATIONS(vacancyId),
    {
      params: {
        startDate,
        endDate,
      },
      responseType: 'blob',
    }
  );

  return response.data;
};

export const viewApplicationCV = async (
  applicationId: string
): Promise<Blob> => {
  const response = await apiClient.get<Blob>(
    API_ENDPOINTS.RECRUITMENT.VIEW_APPLICATION_CV(applicationId),
    {
      responseType: 'blob',
    }
  );

  return response.data;
};

export interface GetVacanciesParams extends PaginationParams {
  category_id?: string;
  society?: Society;
}

export const getVacancies = async (
  params?: GetVacanciesParams
): Promise<Vacancy[]> => {
  const filteredParams = params
    ? Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)])
      )
    : undefined;

  const response = await apiClient.get<ApiResponse<Vacancy[]>>(
    API_ENDPOINTS.RECRUITMENT.GET_VACANCIES,
    { params: filteredParams }
  );
  return response.data.data;
};

export const applyToVacancy = async (
  vacancyId: string,
  data: ApplyToVacancyRequest
): Promise<Application> => {
  const response = await apiClient.post<ApiResponse<Application>>(
    API_ENDPOINTS.RECRUITMENT.APPLY(vacancyId),
    data
  );
  return response.data.data;
};

export const revokeApplication = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.RECRUITMENT.REVOKE_APPLICATION(id));
};

/**
 * GET /admin/recruitment/applications/:id/cv — admin: view an applicant's CV
 * Streams the PDF binary directly to a new browser tab with proper auth headers.
 */
export const adminViewApplicationCv = async (
  applicationId: string
): Promise<void> => {
  const response = await apiClient.get<any>(
    API_ENDPOINTS.RECRUITMENT.ADMIN_VIEW_APPLICATION_CV(applicationId),
    { responseType: 'blob' }
  );
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
};

export const uploadVacancyImage = async (
  vacancyId: string,
  file: File
): Promise<Vacancy> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await apiClient.post<ApiResponse<Vacancy>>(
    API_ENDPOINTS.RECRUITMENT.UPLOAD_VACANCY_IMAGE(vacancyId),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

export const deleteVacancyImage = async (
  vacancyId: string
): Promise<Vacancy> => {
  const response = await apiClient.delete<ApiResponse<Vacancy>>(
    API_ENDPOINTS.RECRUITMENT.DELETE_VACANCY_IMAGE(vacancyId)
  );
  return response.data.data;
};

export const uploadApplicationFile = async (
  file: File
): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<ApiResponse<{ url: string }>>(
    '/recruitment/applications/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

export const getVacancyById = async (id: string): Promise<Vacancy> => {
  const response = await apiClient.get<ApiResponse<Vacancy>>(
    `/recruitment/vacancies/${id}`
  );
  return response.data.data;
};
