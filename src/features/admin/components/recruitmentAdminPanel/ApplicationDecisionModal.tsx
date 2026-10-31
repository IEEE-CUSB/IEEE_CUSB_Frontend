import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button } from '@ieee-ui/ui';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { stripHtmlToText } from '@/shared/utils/helpers';

export type DecisionType = 'ACCEPTED' | 'REJECTED';

export interface ApplicationDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: DecisionType;
  onConfirm: (message?: string) => Promise<void>;
  applicantName?: string;
  applicantEmail?: string;
  vacancyTitle?: string;
  isPending: boolean;
  darkMode?: boolean;
}

export const ApplicationDecisionModal: React.FC<ApplicationDecisionModalProps> = ({
  isOpen,
  onClose,
  decision,
  onConfirm,
  applicantName = 'Applicant',
  applicantEmail,
  vacancyTitle,
  isPending,
  darkMode = false,
}) => {
  const [message, setMessage] = useState('');

  const isAccepted = decision === 'ACCEPTED';

  // Reset message when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setMessage('');
    }
  }, [isOpen]);

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: ['1', '2', '3', false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'clean'],
        ],
        handlers: {
          link: function (this: { quill: any }) {
            const tooltip = this.quill.theme?.tooltip;
            if (!tooltip) return;

            if (!tooltip.root.classList.contains('ql-hidden')) {
              tooltip.hide();
              return;
            }

            let range = this.quill.getSelection();
            if (!range) {
              this.quill.focus();
              range = this.quill.getSelection();
            }
            const preview =
              range && range.length > 0
                ? this.quill.getText(range.index, range.length)
                : '';
            tooltip.edit('link', preview);
          },
        },
      },
    }),
    []
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const plainText = stripHtmlToText(message);
    const finalHtml = plainText.length > 0 ? message.trim() : undefined;
    await onConfirm(finalHtml);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAccepted ? 'Accept Application' : 'Reject Application'}
      size="xl"
      darkMode={darkMode}
    >
      <div className="space-y-4">
        {/* Applicant summary header */}
        <div
          className={`flex items-start gap-3 p-3.5 rounded-xl border ${
            isAccepted
              ? darkMode
                ? 'bg-green-950/20 border-green-800/40 text-gray-200'
                : 'bg-green-50/80 border-green-200 text-gray-800'
              : darkMode
              ? 'bg-red-950/20 border-red-800/40 text-gray-200'
              : 'bg-red-50/80 border-red-200 text-gray-800'
          }`}
        >
          <div
            className={`p-2 rounded-full shrink-0 ${
              isAccepted
                ? darkMode
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-green-100 text-green-600'
                : darkMode
                ? 'bg-red-900/50 text-red-400'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {isAccepted ? (
              <FaCheckCircle className="w-5 h-5" />
            ) : (
              <FaTimesCircle className="w-5 h-5" />
            )}
          </div>
          <div className="text-sm min-w-0">
            <p className="font-semibold text-base">
              {isAccepted ? 'Accept' : 'Reject'} {applicantName}
            </p>
            {vacancyTitle && (
              <p
                className={`truncate ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Position: <span className="font-medium">{vacancyTitle}</span>
              </p>
            )}
            {applicantEmail && (
              <p
                className={`text-xs mt-0.5 truncate ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Email: {applicantEmail}
              </p>
            )}
          </div>
        </div>

        {/* Message prompt */}
        <div className="space-y-1.5">
          <label
            className={`block text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {isAccepted
              ? 'Custom Message (Optional)'
              : 'Feedback / Notes from the Team (Optional)'}
          </label>
          <p
            className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {isAccepted
              ? 'An official acceptance email will be sent automatically. You can include a personalized message, onboarding instructions, or meeting links below:'
              : 'An official rejection email will be sent automatically. You can include constructive feedback, notes, or tips for the applicant below:'}
          </p>

          <div
            id="decision-message-quill"
            className={`react-quill-wrapper ${darkMode ? 'dark-mode-quill' : ''} [&_.ql-editor]:min-h-[140px] [&_.ql-editor]:max-h-[260px]`}
          >
            <ReactQuill
              theme="snow"
              bounds="#decision-message-quill"
              modules={quillModules}
              value={message}
              onChange={setMessage}
              placeholder={
                isAccepted
                  ? 'Write a personalized welcome message or onboarding instructions...'
                  : 'Write feedback, notes, or advice for the applicant (optional)...'
              }
              readOnly={isPending}
            />
          </div>
          <span
            className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {isAccepted
              ? 'This message will appear formatted inside a highlighted message box in the acceptance email.'
              : 'These notes will appear formatted inside a highlighted "Feedback / Notes from the Team" box in the rejection email.'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            buttonText="Cancel"
            onClick={onClose}
            disabled={isPending}
            type="basic"
            width="fit"
            darkMode={darkMode}
          />
          <Button
            buttonText={
              isPending
                ? isAccepted
                  ? 'Accepting...'
                  : 'Rejecting...'
                : isAccepted
                ? 'Accept & Send Email'
                : 'Reject & Send Email'
            }
            onClick={() => handleSubmit()}
            disabled={isPending}
            type={isAccepted ? 'primary' : 'danger'}
            width="fit"
            darkMode={darkMode}
            className="!px-4"
          />
        </div>
      </div>
    </Modal>
  );
};

export interface AcceptApplicationModalProps
  extends Omit<ApplicationDecisionModalProps, 'decision'> {}

export const AcceptApplicationModal: React.FC<AcceptApplicationModalProps> = (
  props
) => <ApplicationDecisionModal {...props} decision="ACCEPTED" />;

export interface RejectApplicationModalProps
  extends Omit<ApplicationDecisionModalProps, 'decision'> {}

export const RejectApplicationModal: React.FC<RejectApplicationModalProps> = (
  props
) => <ApplicationDecisionModal {...props} decision="REJECTED" />;
