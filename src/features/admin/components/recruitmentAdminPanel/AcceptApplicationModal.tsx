import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button } from '@ieee-ui/ui';
import { FaCheckCircle } from 'react-icons/fa';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { stripHtmlToText } from '@/shared/utils/helpers';

interface AcceptApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message?: string) => Promise<void>;
  applicantName?: string;
  applicantEmail?: string;
  vacancyTitle?: string;
  isPending: boolean;
  darkMode?: boolean;
}

export const AcceptApplicationModal: React.FC<AcceptApplicationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  applicantName = 'Applicant',
  applicantEmail,
  vacancyTitle,
  isPending,
  darkMode = false,
}) => {
  const [message, setMessage] = useState('');

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
      title="Accept Application"
      size="xl"
      darkMode={darkMode}
    >
      <div className="space-y-4">
        {/* Applicant summary header */}
        <div
          className={`flex items-start gap-3 p-3.5 rounded-xl border ${
            darkMode
              ? 'bg-green-950/20 border-green-800/40 text-gray-200'
              : 'bg-green-50/80 border-green-200 text-gray-800'
          }`}
        >
          <div
            className={`p-2 rounded-full shrink-0 ${
              darkMode
                ? 'bg-green-900/50 text-green-400'
                : 'bg-green-100 text-green-600'
            }`}
          >
            <FaCheckCircle className="w-5 h-5" />
          </div>
          <div className="text-sm min-w-0">
            <p className="font-semibold text-base">Accept {applicantName}</p>
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
            Custom Message (Optional)
          </label>
          <p
            className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            An official acceptance email will be sent automatically. You can
            include a personalized message, onboarding instructions, or meeting links below:
          </p>

          <div
            id="acceptance-message-quill"
            className={`react-quill-wrapper ${darkMode ? 'dark-mode-quill' : ''} [&_.ql-editor]:min-h-[140px] [&_.ql-editor]:max-h-[260px]`}
          >
            <ReactQuill
              theme="snow"
              bounds="#acceptance-message-quill"
              modules={quillModules}
              value={message}
              onChange={setMessage}
              placeholder="Write a personalized welcome message or onboarding instructions..."
              readOnly={isPending}
            />
          </div>
          <span
            className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            This message will appear formatted inside a highlighted message box in the acceptance email.
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
            buttonText={isPending ? 'Accepting...' : 'Accept & Send Email'}
            onClick={() => handleSubmit()}
            disabled={isPending}
            type="primary"
            width="fit"
            darkMode={darkMode}
            className="!px-4"
          />
        </div>
      </div>
    </Modal>
  );
};
