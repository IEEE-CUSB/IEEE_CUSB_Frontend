import { User } from './auth.types';

import { Category } from './category.types';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status_code?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  message?: string;
}

export type Society = 'EMBS' | 'PES' | 'RAS' | 'CS';
export const SOCIETIES: Society[] = ['EMBS', 'PES', 'RAS', 'CS'];

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface Question {
  id?: string;
  type: 'TEXT' | 'LONG_TEXT' | 'MULTIPLE_CHOICE' | 'FILE';
  question_text: string;
  is_required: boolean;
  options?: string[];
  order?: number;
  allow_multiple_selection?: boolean;
}

export interface Vacancy {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  image_public_id: string | null;
  is_open: boolean;
  category_id?: string | null;
  category?: Category | null;
  questions?: Question[];
  society?: Society | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationExtraData {
  [key: string]: any; // To support dynamic answers
}

export interface Application {
  id: string;
  user_id: string;
  vacancy_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  extra_data: ApplicationExtraData;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface ApplyToVacancyRequest {
  extra_data: ApplicationExtraData;
}

export interface AddVacancy {
  title: string;
  description: string;
  is_open: boolean;
  category_id?: string | null;
  society?: Society | null;
  questions?: Question[];
}

export interface UpdateVacancy {
  title?: string;
  description?: string;
  is_open?: boolean;
  category_id?: string | null;
  society?: Society | null;
  questions?: Question[];
}

export interface UpdateStatus {
  status?: ApplicationStatus;
}

export interface GetAllApplicationsParams {
  vacancyId: string;
  society?: Society;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface ExportApplicationsParams {
  vacancyId: string;
  society?: Society;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}
