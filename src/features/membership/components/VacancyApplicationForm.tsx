import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/shared/store/hooks';
import { Vacancy } from '@/shared/types/recruitment.types';
import { useApplyToVacancy } from '@/shared/queries/recruitment';
import { uploadApplicationFile } from '@/shared/queries/recruitment/recruitment.api';
import { toast } from 'react-hot-toast';
import { InputField, TextArea, Select, Button } from '@ieee-ui/ui';

interface VacancyApplicationFormProps {
  vacancy: Vacancy;
  isDark: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  hasApplied?: boolean;
}

export const VacancyApplicationForm = ({ vacancy, isDark, onSuccess, onCancel, hasApplied }: VacancyApplicationFormProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const isAdmin = user?.role?.name === 'Admin' || user?.role?.name === 'Super Admin';
  const hasCv = !!user?.cv_file_key;

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});

  const applyMutation = useApplyToVacancy();

  const sortedQuestions = useMemo(() => {
    if (!vacancy?.questions) return [];
    return [...vacancy.questions].sort(
      (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)
    );
  }, [vacancy?.questions]);

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const handleFileChange = (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [questionId]: 'File size must be less than 5MB' }));
      return;
    }

    setPendingFiles(prev => ({ ...prev, [questionId]: file }));
    handleInputChange(questionId, file.name);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    sortedQuestions.forEach(q => {
      const qId = (q.id ?? q.question_text) as string;
      if (
        q.is_required &&
        (!answers[qId] ||
          (Array.isArray(answers[qId]) && answers[qId].length === 0))
      ) {
        newErrors[qId] = 'This question is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const finalAnswers = { ...answers };
      
      for (const [qId, file] of Object.entries(pendingFiles)) {
        try {
          const res = await uploadApplicationFile(file);
          finalAnswers[qId] = res.url;
        } catch (err) {
          toast.error('Failed to upload file for a question.');
          setIsSubmitting(false);
          return;
        }
      }

      // Preserve question order in extra_data
      const extra_data: Record<string, any> = {};
      sortedQuestions.forEach(q => {
        const qId = (q.id ?? q.question_text) as string;
        if (finalAnswers[qId] !== undefined) {
          const key = q.question_text || qId;
          extra_data[key] = finalAnswers[qId];
        }
      });

      await applyMutation.mutateAsync({
        vacancyId: vacancy.id,
        data: { extra_data }
      });
      toast.success('Successfully applied to ' + vacancy.title);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`text-center p-8 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
        <h4 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sign in to Apply</h4>
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>You must be logged in to apply for vacancies.</p>
        <Button buttonText="Login / Register" onClick={() => navigate('/login')} type="primary" darkMode={isDark} />
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className={`text-center p-6 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Admins cannot apply to vacancies.</p>
      </div>
    );
  }

  if (!hasCv) {
    return (
      <div className={`text-center p-8 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
        <h4 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>CV Required</h4>
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Please upload your CV in your Profile before applying.</p>
        <Button buttonText="Go to Profile" onClick={() => navigate('/profile')} type="primary" darkMode={isDark} />
      </div>
    );
  }

  if (hasApplied) {
    return (
      <div className={`text-center p-6 rounded-xl border ${isDark ? 'border-green-900/40 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
        <p className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>You have already applied to this position.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {sortedQuestions.map((q) => {
        const qId = (q.id ?? q.question_text) as string;
        return (
          <div key={qId} className="space-y-1">
            {q.type === 'TEXT' && (
              <InputField
                id={`q-${qId}`}
                label={`${q.question_text}${q.is_required ? ' *' : ''}`}
                value={answers[qId] || ''}
                onChange={(e: any) => handleInputChange(qId, e.target.value)}
                error={errors[qId]}
                darkMode={isDark}
              />
            )}
            {q.type === 'LONG_TEXT' && (
              <TextArea
                id={`q-${qId}`}
                label={`${q.question_text}${q.is_required ? ' *' : ''}`}
                value={answers[qId] || ''}
                onChange={(e: any) => handleInputChange(qId, e.target.value)}
                error={errors[qId]}
                darkMode={isDark}
              />
            )}
            {q.type === 'MULTIPLE_CHOICE' && (
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {q.question_text}{q.is_required && ' *'}
                </label>
                {q.allow_multiple_selection ? (
                  <div className="space-y-2">
                    {q.options?.map((opt, i) => {
                      const isChecked = Array.isArray(answers[qId]) && answers[qId].includes(opt);
                      return (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e: any) => {
                              const current = Array.isArray(answers[qId]) ? answers[qId] : [];
                              if (e.target.checked) {
                                handleInputChange(qId, [...current, opt]);
                              } else {
                                handleInputChange(qId, current.filter((v: string) => v !== opt));
                              }
                            }}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                          />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{opt}</span>
                        </label>
                      );
                    })}
                    {errors[qId] && <p className="text-red-500 text-xs mt-1">{errors[qId]}</p>}
                  </div>
                ) : (
                  <Select
                    id={`q-${qId}`}
                    label=""
                    value={answers[qId] || ''}
                    onChange={(e) => handleInputChange(qId, e.target.value)}
                    options={[
                      { label: 'Select an option...', value: '' },
                      ...(q.options?.map((opt) => ({ label: opt, value: opt })) || []),
                    ]}
                    error={errors[qId]}
                    darkMode={isDark}
                  />
                )}
              </div>
            )}
            {q.type === 'FILE' && (
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {q.question_text}{q.is_required && ' *'}
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(qId, e)}
                  className={`block w-full text-sm ${isDark ? 'text-gray-300 file:bg-gray-700 file:text-gray-300' : 'text-gray-500 file:bg-gray-100 file:text-gray-700'} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold hover:file:bg-opacity-80 transition-colors cursor-pointer`}
                />
                {errors[qId] && <p className="text-red-500 text-xs mt-1">{errors[qId]}</p>}
              </div>
            )}
          </div>
        );
      })}
      
      {sortedQuestions.length === 0 && (
         <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} py-4`}>
           No questions to answer. Click submit to apply with your CV.
         </p>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button buttonText="Cancel" onClick={onCancel} type="basic" width="fit" darkMode={isDark} disabled={isSubmitting || applyMutation.isPending} />
        )}
        <Button
          buttonText="Submit Application"
          type="primary"
          width="fit"
          loading={isSubmitting || applyMutation.isPending}
          disabled={isSubmitting || applyMutation.isPending}
          darkMode={isDark}
          onClick={() => onSubmit({ preventDefault: () => {} } as any)}
        />
      </div>
    </form>
  );
};
