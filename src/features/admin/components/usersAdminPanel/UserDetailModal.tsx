import { useState } from 'react';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  FiAward,
  FiDownload,
  FiEye,
  FiFileText,
  FiLoader,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiUsers,
} from 'react-icons/fi';
import { Modal } from '@ieee-ui/ui';
import { usersApi, useRoles, useGetAdminUserApplications } from '@/shared/queries/users/users.queries';
import { useEvents } from '@/shared/queries/events/events.queries';
import { useWorkshops } from '@/shared/queries/workshops/workshops.queries';
import { useGetVacancies } from '@/shared/queries/recruitment';
import type { User } from '@/shared/types/auth.types';
import toast from 'react-hot-toast';

import { useAppSelector } from '@/shared/store/hooks';
import { RoleName } from '@/shared/types/auth.types';

const value = (input: string | number | null | undefined) =>
  input === null || input === undefined || input === '' ? 'Not provided' : String(input);

const hasCv = (user: User) => Boolean(user.cv_file_key || user.cv_url);

interface UserDetailModalProps {
  user: User | null;
  onClose: () => void;
  onOpenChangeRole: (user: User) => void;
}

export const UserDetailModal = ({
  user,
  onClose,
  onOpenChangeRole,
}: UserDetailModalProps) => {
  const { isDark } = useTheme();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const isSuperAdmin = currentUser?.role?.name === RoleName.SUPER_ADMIN;
  const [cvLoading, setCvLoading] = useState<'view' | 'download' | null>(null);
  const { data: roles } = useRoles();
  const { data: userApplications, isLoading: isLoadingApplications } = useGetAdminUserApplications(user?.id || '', !!user);

  const { data: eventsData } = useEvents({ page: 1, limit: 1000 });
  const { data: workshopsData } = useWorkshops({ page: 1, limit: 1000 });
  const { data: vacanciesData } = useGetVacancies();

  if (!user) return null;

  const initials =
    user.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U';

  const details = [
    { label: 'Email', value: user.email, icon: FiMail },
    { label: 'Phone', value: user.phone, icon: FiPhone },
    { label: 'Faculty', value: user.faculty, icon: FiAward },
    { label: 'University', value: user.university, icon: FiAward },
    { label: 'Academic year', value: user.academic_year, icon: FiUsers },
    { label: 'Major', value: user.major, icon: FiAward },
  ];

  const handleCv = async (action: 'view' | 'download') => {
    if (!hasCv(user)) return;

    setCvLoading(action);
    try {
      if (action === 'view') {
        await usersApi.adminViewCv(user.id);
      } else {
        await usersApi.adminDownloadCv(user.id, `${user.name.replace(/\s+/g, '_')}_CV.pdf`);
      }
    } catch {
      toast.error(`Failed to ${action} CV. Please try again.`);
    } finally {
      setCvLoading(null);
    }
  };

  return (
    <Modal isOpen={!!user} onClose={onClose} size="4xl" darkMode={isDark}>
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background px-6 py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full bg-primary text-xl sm:text-2xl font-semibold text-primary-foreground">
                {initials}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground truncate" title={user.name}>{user.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground truncate" title={`@${user.username}`}>@{user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-fit rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground">
                {user.role?.name || roles?.find(r => r.id === user.role_id)?.name || 'Visitor'}
              </span>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChangeRole(user);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  title="Change user role"
                >
                  <FiShield className="h-3.5 w-3.5" />
                  Change Role
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <FiUser className="h-5 w-5 text-primary" />
                About
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {user.bio || 'No bio added yet.'}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground">
                <FiAward className="h-5 w-5 text-primary shrink-0" />
                Account details
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {details.map(({ label, value: detailValue, icon: Icon }) => {
                  const displayVal = value(detailValue);
                  const isEmail = label.toLowerCase() === 'email' && Boolean(detailValue);
                  const isPhone = label.toLowerCase() === 'phone' && Boolean(detailValue);

                  return (
                    <div
                      key={label}
                      className="group relative min-w-0 overflow-hidden rounded-xl border border-border bg-card/60 p-3.5 transition-all hover:border-primary/30 hover:bg-card/90"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{label}</span>
                        </div>
                        {(isEmail || isPhone) && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(String(detailValue));
                              toast.success(`${label} copied!`);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary hover:underline p-0.5 rounded cursor-pointer"
                            title={`Copy ${label}`}
                          >
                            Copy
                          </button>
                        )}
                      </div>
                      <div className="mt-2 min-w-0">
                        {isEmail ? (
                          <a
                            href={`mailto:${detailValue}`}
                            className="block text-sm font-medium text-primary hover:underline break-all"
                            title={String(detailValue)}
                          >
                            {displayVal}
                          </a>
                        ) : isPhone ? (
                          <a
                            href={`tel:${detailValue}`}
                            className="block text-sm font-medium text-foreground hover:text-primary transition-colors break-all"
                            title={String(detailValue)}
                          >
                            {displayVal}
                          </a>
                        ) : (
                          <p
                            className="text-sm font-medium text-foreground break-words"
                            title={String(detailValue || '')}
                          >
                            {displayVal}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-5">
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <FiFileText className="h-5 w-5 text-primary" />
              CV
            </div>
            {hasCv(user) ? (
              <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">
                  {user.name.replace(/\s+/g, '_')}_CV.pdf
                </p>
                <p className="mt-1 text-xs text-muted-foreground">PDF document</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => handleCv('view')}
                    disabled={cvLoading !== null}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
                  >
                    {cvLoading === 'view' ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiEye className="h-4 w-4" />}
                    View CV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCv('download')}
                    disabled={cvLoading !== null}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                  >
                    {cvLoading === 'download' ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiDownload className="h-4 w-4" />}
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                No CV uploaded for this user.
              </div>
            )}
          </div>
          
          <div className="rounded-2xl border border-border bg-background/70 p-5 lg:col-span-2">
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <FiFileText className="h-5 w-5 text-primary" />
              Applications
            </div>
            {isLoadingApplications ? (
                <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                  <FiLoader className="h-4 w-4 animate-spin " />
                  Loading applications...
                </div>
              ) : userApplications ? (
                <div className="mt-5 grid sm:grid-cols-3 gap-6">
                  {/* Events */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      Event Registrations
                    </h3>
                    {userApplications.eventRegistrations.length > 0 ? (
                      <ul className="space-y-3">
                        {userApplications.eventRegistrations.map(reg => {
                          const eventName = eventsData?.data.find(e => e.id === reg.event_id)?.title;
                          return (
                            <li key={reg.id} className="text-sm bg-background rounded-xl p-3 border border-border flex flex-col gap-2 shadow-sm">
                              <div className="flex justify-between items-center w-full">
                                <span className="font-medium text-foreground truncate mr-2" title={eventName || reg.event_id}>
                                  {eventName || `ID: ${reg.event_id.split('-')[0]}`}
                                </span>
                                <span className="font-bold px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] uppercase tracking-wider whitespace-nowrap">{reg.status}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-md border border-dashed border-border">No event registrations.</p>
                    )}
                  </div>
                  
                  {/* Workshops */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      Workshop Registrations
                    </h3>
                    {userApplications.workshopRegistrations.length > 0 ? (
                      <ul className="space-y-3">
                        {userApplications.workshopRegistrations.map(reg => {
                          const workshopName = workshopsData?.data.find(w => w.id === reg.workshop_id)?.title;
                          return (
                            <li key={reg.id} className="text-sm bg-background rounded-xl p-3 border border-border flex flex-col gap-2 shadow-sm">
                              <div className="flex justify-between items-center w-full">
                                <span className="font-medium text-foreground truncate mr-2" title={workshopName || reg.workshop_id}>
                                  {workshopName || `ID: ${reg.workshop_id.split('-')[0]}`}
                                </span>
                                <span className="font-bold px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] uppercase tracking-wider whitespace-nowrap">{reg.status}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-md border border-dashed border-border">No workshop registrations.</p>
                    )}
                  </div>
                  
                  {/* Vacancies */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      Vacancy Applications
                    </h3>
                    {userApplications.vacancyApplications.length > 0 ? (
                      <ul className="space-y-3">
                        {userApplications.vacancyApplications.map(app => {
                          const vacancyName = vacanciesData?.find(v => v.id === app.vacancy_id)?.title;
                          return (
                            <li key={app.id} className="text-sm bg-background rounded-xl p-3 border border-border flex flex-col gap-2 shadow-sm">
                              <div className="flex justify-between items-center w-full">
                                <span className="font-medium text-foreground truncate mr-2" title={vacancyName || app.vacancy_id}>
                                  {vacancyName || `ID: ${app.vacancy_id.split('-')[0]}`}
                                </span>
                                <span className="font-bold px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] uppercase tracking-wider whitespace-nowrap">{app.status}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-md border border-dashed border-border">No vacancy applications.</p>
                    )}
                  </div>
                </div>
              ) : (
                 <div className="mt-5 text-sm text-muted-foreground text-center p-4">No applications found.</div>
              )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailModal;
