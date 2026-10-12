import { useEffect, useState } from 'react';
import {
  FiAward,
  FiDownload,
  FiEye,
  FiFileText,
  FiLoader,
  FiMail,
  FiPhone,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { User } from '@/shared/types/auth.types';
import { ApplicationExtraData } from '@/shared/types/recruitment.types';
import { apiClient } from '@/shared/config/api.config';
import { usersApi } from '@/shared/queries/users/users.queries';
import toast from 'react-hot-toast';

interface UserInfoProps {
  isOpen: boolean;
  onClose: () => void;
  User?: User;
  extraDetails?: ApplicationExtraData;
  side?: 'left' | 'right';
  width?: string;
}

const value = (input: string | number | null | undefined) =>
  input === null || input === undefined || input === '' ? 'Not provided' : String(input);

const hasCv = (user?: User) => Boolean(user?.cv_file_key || user?.cv_url);

export default function UserInfo({
  isOpen,
  onClose,
  User,
  extraDetails,
  side = 'right',
  width = 'min(92vw, 820px)',
}: UserInfoProps) {
    const [cvLoading, setCvLoading] = useState<'view' | 'download' | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'responses'>('info');
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const handleDownloadApplicationFile = async (fileUrl: string) => {
    // If it's a Cloudinary link or external link, open directly
    if (!fileUrl.includes('applications/')) {
      window.open(fileUrl, '_blank');
      return;
    }

    setDownloadingFile(fileUrl);
    try {
      const urlParts = fileUrl.split('applications/');
      const fileKey = 'applications/' + urlParts[urlParts.length - 1];

      const response = await apiClient.get<any>(`/admin/recruitment/file/download?key=${encodeURIComponent(fileKey)}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (e) {
      toast.error('Failed to download file. It might have been deleted.');
    } finally {
      setDownloadingFile(null);
    }
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const sideClasses = side === 'right' ? 'right-0' : 'left-0';
  const translateClosed = side === 'right' ? 'translate-x-full' : '-translate-x-full';
  const initials =
    User?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'U';
  const details = [
    { label: 'Email', value: User?.email, icon: FiMail },
    { label: 'Phone', value: User?.phone, icon: FiPhone },
    { label: 'Faculty', value: User?.faculty, icon: FiAward },
    { label: 'University', value: User?.university, icon: FiAward },
    { label: 'Academic year', value: User?.academic_year, icon: FiUsers },
    { label: 'Major', value: User?.major, icon: FiAward },
  ];

  const handleCv = async (action: 'view' | 'download') => {
    if (!User || !hasCv(User)) return;

    setCvLoading(action);
    try {
      if (action === 'view') {
        await usersApi.adminViewCv(User.id);
      } else {
        await usersApi.adminDownloadCv(User.id, `${User.name.replace(/\s+/g, '_')}_CV.pdf`);
      }
    } catch {
      toast.error(`Failed to ${action} CV. Please try again.`);
    } finally {
      setCvLoading(null);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={User?.name ? 'slideout-title' : undefined}
        className={`fixed top-0 ${sideClasses} z-50 h-full bg-card text-foreground shadow-2xl border-l border-border transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : translateClosed
        }`}
        style={{ width: `min(100vw, ${width})` }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close user details"
          className="absolute right-4 top-4 z-10 rounded-full border border-border bg-background/80 backdrop-blur-sm p-2 text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="h-full overflow-y-auto bg-background p-4 sm:p-6">
          {!User ? (
            <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No user selected.
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background px-6 py-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full bg-primary text-xl sm:text-2xl font-semibold text-primary-foreground">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 id="slideout-title" className="text-xl sm:text-2xl font-semibold text-foreground truncate" title={User.name}>
                        {User.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground truncate" title={`@${User.username}`}>@{User.username}</p>
                    </div>
                  </div>
                  <span className="w-fit shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground">
                    {User.role?.name || 'Visitor'}
                  </span>
                </div>
              </div>

              <div className="flex border-b border-border px-6 pt-4">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'info'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Student Info
                </button>
                {extraDetails && Object.keys(extraDetails).length > 0 && (
                  <button
                    onClick={() => setActiveTab('responses')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                      activeTab === 'responses'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Form Responses
                  </button>
                )}
              </div>

              <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
                {activeTab === 'info' ? (
                  <>
                    <div className="space-y-6 min-w-0">
                      <div className="rounded-2xl border border-border bg-background/70 p-4 sm:p-5">
                        <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground">
                          <FiUser className="h-5 w-5 text-primary shrink-0" />
                          About
                        </div>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground break-words">
                          {User.bio || 'No bio added yet.'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-background/70 p-4 sm:p-5">
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

                    <div className="rounded-2xl border border-border bg-background/70 p-4 sm:p-5 h-fit min-w-0">
                      <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground">
                        <FiFileText className="h-5 w-5 text-primary shrink-0" />
                        CV
                      </div>
                      {hasCv(User) ? (
                        <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-4 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate" title={`${User.name.replace(/\s+/g, '_')}_CV.pdf`}>
                            {User.name.replace(/\s+/g, '_')}_CV.pdf
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">PDF document</p>
                          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <button
                              type="button"
                              onClick={() => handleCv('view')}
                              disabled={cvLoading !== null}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60 cursor-pointer"
                            >
                              {cvLoading === 'view' ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiEye className="h-4 w-4" />}
                              View CV
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCv('download')}
                              disabled={cvLoading !== null}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60 cursor-pointer"
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
                  </>
                ) : (
                  <div className="col-span-1 lg:col-span-2 min-w-0">
                    {extraDetails && Object.keys(extraDetails).length > 0 && (
                      <div className="rounded-2xl border border-border bg-background/70 p-4 sm:p-5 min-w-0">
                        <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground mb-4">
                          <FiFileText className="h-5 w-5 text-primary shrink-0" />
                          Form Responses
                        </div>
                        <div className="space-y-4 min-w-0">
                          {Object.entries(extraDetails).map(([question, answer]) => (
                            <div key={question} className="rounded-xl border border-border bg-card/60 p-4 min-w-0">
                              <p className="text-sm font-semibold text-foreground mb-2 break-words">{question}</p>
                              {typeof answer === 'string' && answer.startsWith('http') ? (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadApplicationFile(answer)}
                                  disabled={downloadingFile === answer}
                                  className="inline-flex text-left items-center gap-2 break-all text-sm text-primary hover:underline bg-primary/10 px-3 py-2 rounded-lg transition-colors hover:bg-primary/20 disabled:opacity-60 max-w-full cursor-pointer"
                                >
                                  {downloadingFile === answer ? <FiLoader className="w-4 h-4 animate-spin shrink-0" /> : <FiDownload className="w-4 h-4 shrink-0" />}
                                  <span className="truncate">View / Download File</span>
                                </button>
                              ) : (
                                <p className="text-sm leading-6 text-muted-foreground break-words">{Array.isArray(answer) ? answer.join(", ") : String(answer)}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
