import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { Layout } from '../shared/components/hoc/Layout';
import { ProtectedRoute } from '../shared/components/hoc/ProtectedRoute';
import { PublicRoute } from '../shared/components/hoc/PublicRoute';
import {
  NotFoundPage,
  LoginPage,
  RegisterPage,
  UnderConstructionPage,
  EventDetailsPage,
  AboutUsPage,
  HomePage,
  CommitteesPage,
  AwardsPage,
  MembershipPage,
  VacancyDetailsPage,
} from './pages';
import EventsPage from './pages/EventsPage';
import { AdminLayout } from '../features/admin/layouts/AdminLayout';
import { EventsPage as AdminEventsPage } from './pages/admin/EventsPage';
import { CommitteesPage as AdminCommittees } from './pages/admin/CommitteesPage';
import { AwardsPage as AdminAwardsPage } from './pages/admin/AwardsPage';
import { AdminWorkshopsPage } from './pages/admin/WorkshopsPage';
import { RecruitmentPage as AdminRecruitmentPage } from './pages/admin/RecruitmentPage';
import { UsersPage as AdminUsersPage } from './pages/admin/UsersPage';
import { RoleName } from '@/shared/types/auth.types';
import { WorkshopsPage } from './pages/WorkshopsPage';
import { WorkshopDetailsPage } from './pages/WorkshopDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
/**
 * Application Routes Configuration
 * Using React Router v6 Data APIs (createBrowserRouter)
 */

const routes: RouteObject[] = [
  // Auth Routes (no layout)
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  // Admin Routes (Protected - requires Admin or Super Admin role)
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRoles={[RoleName.ADMIN, RoleName.SUPER_ADMIN]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <UnderConstructionPage />, // Dashboard - Under Construction
      },
      {
        path: 'events',
        element: <UnderConstructionPage />, // Events - Working
      },
      {
        path: 'committees',
        element: <UnderConstructionPage />, // Events - Working
      },
      {
        path: 'awards',
        element: <UnderConstructionPage />, // Awards - Working
      },
      {
        path: 'workshops',
        element: <UnderConstructionPage />, // Workshops - Working
      },
      {
        path: 'users',
        element: <UnderConstructionPage />, // Users - Working
      },
      {
        path: 'recruitment',
        element: <AdminRecruitmentPage />, // Recruitment - Under Construction
      },
    ],
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />, // Home - Under Construction
      },
      {
        path: 'about',
        element: <AboutUsPage />, // About Us - Now Working!
      },
      {
        path: 'committees',
        element: <CommitteesPage />,
      },
      {
        path: 'events',
        element: <EventsPage />, // Events - Working
      },
      {
        path: 'events/:id',
        element: <EventDetailsPage />, // Event Details - Working
      },
      {
        path: 'workshops',
        element: <WorkshopsPage />, // Workshops - Working
      },
      {
        path: 'workshops/:id',
        element: <WorkshopDetailsPage />, // Workshop Details - Working
      },
      {
        path: 'join',
        element: <MembershipPage />,
      },
      {
        path: 'recruitment/vacancies/:id',
        element: <VacancyDetailsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />, // Profile - working
      },
      {
        path: 'settings',
        element: <UnderConstructionPage />, // Settings - Under Construction
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
      {
        path: 'awards',
        element: <AwardsPage />, // Awards
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
