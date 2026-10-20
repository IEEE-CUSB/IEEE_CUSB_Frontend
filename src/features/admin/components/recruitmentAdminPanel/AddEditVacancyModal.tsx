import React, { useState, useRef, useEffect } from 'react';
import { InputField, Button, Modal, Select } from '@ieee-ui/ui';
import { useTheme } from '@/shared/hooks/useTheme';
import {  FiUpload, FiTrash2, FiImage, FiX, FiPlus, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Toggle } from '@/shared/components/ui/Toggle';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  AddVacancy,
  UpdateVacancy,
  Vacancy,
  Question,
} from '@/shared/types/recruitment.types';
import { CategoryType } from '@/shared/types/category.types';
import { useUploadVacancyImage, useDeleteVacancyImage } from '@/shared/queries/recruitment';
import { useGetCategories } from '@/shared/queries/categories/categories.queries';

interface ExtendedAddEditVacancyModalProps {
  vacancy?: Vacancy;
  apiVacancy?: Vacancy;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddVacancy | UpdateVacancy, id?: string) => Promise<string | undefined>;
  isPending?: boolean;
}

interface FormValues {
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_open: boolean;
  category_id: string;
  questions: Question[];
}

const empty = (): FormValues => ({
  title: '',
  description: '',
  created_at: '',
  updated_at: '',
  is_open: true,
  category_id: '',
  questions: [],
});

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const toForm = (v?: Vacancy): FormValues =>
  v
    ? {
        title: v.title,
        description: v.description ?? '',
        created_at: formatDateForInput(v.created_at),
        updated_at: formatDateForInput(v.updated_at),
        is_open: v.is_open,
        category_id: v.category_id ?? v.category?.id ?? '',
        questions: v.questions || [],
      }
    : empty();

type Errs = Partial<Record<keyof FormValues, string>>;

const validate = (v: FormValues): Errs => {
  const e: Errs = {};
  if (!v.title.trim()) {
    e.title = 'Title is required.';
  } else if (v.title.trim().length < 6) {
    e.title = 'Title must be at least 6 characters.';
  } else if (v.title.trim().length > 100) {
    e.title = 'Title must be less than 100 characters.';
  }

  // Quill might put '<p><br></p>' for empty
  const plainTextDesc = v.description.replace(/<[^>]*>?/gm, '').trim();
  if (!plainTextDesc) {
    e.description = 'Description is required.';
  }
  return e;
};

export const AddEditVacancyModal: React.FC<ExtendedAddEditVacancyModalProps> = ({
  vacancy,
  apiVacancy,
  isOpen,
  onClose,
  onSave,
  isPending = false,
}) => {
  const { isDark } = useTheme();
  const isEditMode = !!vacancy;
  const vacancyId = apiVacancy?.id || vacancy?.id;

  // Image upload state
  const primaryFileRef = useRef<HTMLInputElement>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);

  const uploadImageMutation = useUploadVacancyImage();
  const deleteImageMutation = useDeleteVacancyImage();
  const { data: categoriesPayload } = useGetCategories({ type: CategoryType.RECRUITMENT, limit: 100 });
  const categories = categoriesPayload?.categories || [];

  // Form state
  const [formKey, setFormKey] = useState(0);
  const [formValues, setFormValues] = useState<FormValues>(() => toForm(vacancy));
  const [errors, setErrors] = useState<Errs>({});
  const [isSaving, setIsSaving] = useState(false);

  // Custom Quill modules to toggle link tooltip and ensure clean options
  const quillModules = React.useMemo(
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

            // If already open, clicking link button toggles it closed
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

  // Reset when modal opens / vacancy changes
  React.useEffect(() => {
    setFormKey(prev => prev + 1);
  }, [vacancy?.id, isOpen]);

  React.useEffect(() => {
    setFormValues(toForm(vacancy));
    setErrors({});
    setIsSaving(false);
    setPendingImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setDeleteImage(false);
  }, [formKey]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, []);

  /* Image handlers */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setPendingImage(file);
    setImagePreview(URL.createObjectURL(file));
    setDeleteImage(false);
    if (primaryFileRef.current) primaryFileRef.current.value = '';
  };

  const handleClearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setPendingImage(null);
    setImagePreview(null);
  };

  const handleMarkDeleteImage = () => {
    handleClearImage();
    setDeleteImage(true);
  };

  /* Form handlers */
  const handleInputChange =
    (field: 'title') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setFormValues(prev => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

  const handleDescriptionChange = (value: string) => {
    setFormValues(prev => ({ ...prev, description: value }));
    if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormValues(prev => ({ ...prev, category_id: e.target.value }));
  };

  /* Questions Handlers */
  const addQuestion = () => {
    setFormValues(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: Date.now().toString(),
          type: 'TEXT',
          question_text: '',
          is_required: false,
        },
      ],
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setFormValues(prev => {
      const newQuestions = [...prev.questions];
      const q = { ...newQuestions[index], [field]: value } as Question;
      if (field === 'type' && value !== 'MULTIPLE_CHOICE') {
        q.options = [];
      } else if (field === 'type' && value === 'MULTIPLE_CHOICE') {
        q.options = ['Option 1'];
      }
      newQuestions[index] = q;
      return { ...prev, questions: newQuestions };
    });
  };

  const removeQuestion = (index: number) => {
    setFormValues(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    setFormValues(prev => {
      const newQuestions = [...prev.questions];
      if (direction === 'up' && index > 0) {
        const temp = newQuestions[index - 1];
        newQuestions[index - 1] = newQuestions[index]!;
        newQuestions[index] = temp!;
      } else if (direction === 'down' && index < newQuestions.length - 1) {
        const temp = newQuestions[index + 1];
        newQuestions[index + 1] = newQuestions[index]!;
        newQuestions[index] = temp!;
      }
      return { ...prev, questions: newQuestions };
    });
  };




  const addOption = (questionIndex: number) => {
    setFormValues(prev => {
      const newQuestions = [...prev.questions];
      const q = { ...newQuestions[questionIndex]! };
      q.options = [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`];
      newQuestions[questionIndex] = q;
      return { ...prev, questions: newQuestions };
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setFormValues(prev => {
      const newQuestions = [...prev.questions];
      const q = { ...newQuestions[questionIndex]! };
      const newOptions = [...(q.options || [])];
      newOptions[optionIndex] = value;
      q.options = newOptions;
      newQuestions[questionIndex] = q;
      return { ...prev, questions: newQuestions };
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setFormValues(prev => {
      const newQuestions = [...prev.questions];
      const q = { ...newQuestions[questionIndex]! };
      const newOptions = [...(q.options || [])];
      newOptions.splice(optionIndex, 1);
      q.options = newOptions;
      newQuestions[questionIndex] = q;
      return { ...prev, questions: newQuestions };
    });
  };

  /* Save */
  const handleSave = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }

    const validationErrors = validate(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // validate questions
    for (const q of formValues.questions) {
      if (!q.question_text.trim()) {
        toast.error('All questions must have a title.');
        return;
      }
      if (q.type === 'MULTIPLE_CHOICE' && (!q.options || q.options.length === 0)) {
        toast.error('Multiple choice questions must have at least one option.');
        return;
      }
    }

    setIsSaving(true);

    const payload: AddVacancy | UpdateVacancy = {
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      is_open: formValues.is_open,
      category_id: formValues.category_id || null,
      questions: formValues.questions.map((q, i) => ({
        ...q,
        id: q.id?.length === 13 && !isNaN(Number(q.id)) ? undefined : q.id, // strip temp frontend id if needed
        order: i,
      })),
    };

    try {
      const savedId = await onSave(payload, vacancyId);

      // After save, handle image upload/delete if editing an existing vacancy
      if (savedId) {
        const promises = [];
        if (pendingImage) promises.push(uploadImageMutation.mutateAsync({ id: savedId, file: pendingImage }));
        if (deleteImage) promises.push(deleteImageMutation.mutateAsync(savedId));
        await Promise.all(promises);
      }
      onClose();
    } catch {
      setIsSaving(false);
    }
  };

  const currentImageUrl = imagePreview || (deleteImage ? null : (apiVacancy?.image_url || vacancy?.image_url));

  return (
    <Modal
      title={isEditMode ? 'Edit Vacancy' : 'Add New Vacancy'}
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      darkMode={isDark}
    >
      <div className="space-y-6">
        {/* Form fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <InputField
              label="Vacancy Title"
              value={formValues.title}
              placeholder="e.g. Backend Development"
              onChange={handleInputChange('title')}
              id="title"
              error={errors.title}
              darkMode={isDark}
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <div
              id="vacancy-description-quill"
              className={`react-quill-wrapper ${isDark ? 'dark-mode-quill' : ''}`}
            >
              <ReactQuill
                theme="snow"
                bounds="#vacancy-description-quill"
                modules={quillModules}
                value={formValues.description}
                onChange={handleDescriptionChange}
                placeholder="Write a clear and detailed description of the vacancy..."
              />
            </div>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Form Builder Section */}
        <div className={`p-4 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Form Builder</h3>
          </div>
          <div className="space-y-4">
            {formValues.questions.map((q, index) => (
              <div key={index} className={`p-4 rounded-xl border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <InputField
                      label={`Question ${index + 1}`}
                      value={q.question_text}
                      onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                      placeholder="Enter question text..."
                      darkMode={isDark}
                      id={`q-${index}`}
                    />
                  </div>
                  <div className="mt-8 flex flex-col gap-1">
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => moveQuestion(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <FiArrowUp className="w-4 h-4" />
                      </button>
                      <button type="button"
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === formValues.questions.length - 1}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <FiArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    <button type="button"
                      onClick={() => removeQuestion(index)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors flex justify-center"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Select
                      id={`type-${index}`}
                      label="Type"
                      value={q.type}
                      onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                      options={[
                        { label: 'Short Text', value: 'TEXT' },
                        { label: 'Long Text', value: 'LONG_TEXT' },
                        { label: 'Multiple Choice', value: 'MULTIPLE_CHOICE' },
                        { label: 'File Upload', value: 'FILE' },
                      ]}
                      darkMode={isDark}
                    />
                  </div>
                  <div className="pt-6">
                    <Toggle
                      checked={q.is_required}
                      onChange={(val) => updateQuestion(index, 'is_required', val)}
                      labelOn="Required"
                      labelOff="Optional"
                      darkMode={isDark}
                    />
                  </div>
                </div>

                {q.type === 'MULTIPLE_CHOICE' && (
                  <div className={`mt-4 p-3 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Options</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={q.allow_multiple_selection || false}
                          onChange={(e) => updateQuestion(index, 'allow_multiple_selection', e.target.checked)}
                          className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Allow Multiple Selection</span>
                      </label>
                    </div>
                    {q.options?.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2 mb-2">
                        <div className="flex-1">
                          <InputField
                            id={`opt-${index}-${optIndex}`}
                            value={opt}
                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            darkMode={isDark}
                          />
                        </div>
                        <button type="button" onClick={() => removeOption(index, optIndex)} className="p-1.5 text-red-500 hover:bg-red-100 rounded">
                          <FiX />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addOption(index)} className={`text-sm flex items-center gap-1 mt-2 ${isDark ? 'text-primary-light hover:text-primary' : 'text-primary hover:text-primary-dark'}`}>
                      <FiPlus /> Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {formValues.questions.length === 0 && (
              <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No questions added yet. Click "Add Question" to start building your form.</p>
            )}

            <div className="flex justify-center mt-4">
              <Button
                buttonText="Add Question"
                onClick={addQuestion}
                type="basic"
                width="fit"
                darkMode={isDark}
              />
            </div>
          </div>
        </div>

        {/* Category + Status row */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Select
              id="category"
              label="Category"
              options={[
                { label: 'Select a category...', value: '' },
                ...categories.map(c => ({ label: c.name, value: c.id })),
              ]}
              value={formValues.category_id}
              onChange={handleCategoryChange}
              darkMode={isDark}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${ isDark ? 'text-gray-300' : 'text-gray-700' }`}>
              Status
            </label>
            <Toggle
              checked={formValues.is_open}
              onChange={val => setFormValues(prev => ({ ...prev, is_open: val }))}
              labelOn="Open"
              labelOff="Closed"
              darkMode={isDark}
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${ isDark ? 'text-gray-300' : 'text-gray-700' }`}>
            Position Image
          </label>

          {currentImageUrl ? (
            <div className="relative w-full h-44 rounded-xl overflow-hidden group">
              <img src={currentImageUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button type="button"
                  onClick={() => primaryFileRef.current?.click()}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Replace image"
                >
                  <FiUpload className="w-5 h-5" />
                </button>
                <button type="button"
                  onClick={apiVacancy?.image_public_id && !pendingImage ? handleMarkDeleteImage : handleClearImage}
                  className="p-2 rounded-lg bg-red-500/70 hover:bg-red-500 text-white transition-colors"
                  title="Remove image"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
              {pendingImage && (
                <div className="absolute top-2 right-2">
                  <button type="button" onClick={handleClearImage} className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70">
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button type="button"
              onClick={() => primaryFileRef.current?.click()}
              className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'border-gray-600 hover:border-primary/60 text-gray-500 hover:text-gray-400'
                  : 'border-gray-300 hover:border-primary/60 text-gray-400 hover:text-gray-500'
              }`}
            >
              <FiImage className="w-8 h-8" />
              <span className="text-sm font-medium">Click to upload image</span>
              <span className="text-xs opacity-70">PNG, JPG up to 5MB</span>
            </button>
          )}

          <input
            ref={primaryFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

          {pendingImage && !vacancyId && (
            <p className={`mt-1.5 text-xs ${ isDark ? 'text-yellow-400' : 'text-yellow-600' }`}>
              ⚠ Image will be uploaded after saving the vacancy. Re-edit to add the image.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <Button
            buttonText="Cancel"
            onClick={onClose}
            type="basic"
            width="fit"
            darkMode={isDark}
            disabled={isPending || isSaving}
          />
          <Button
            buttonText={isEditMode ? 'Save Changes' : 'Create Vacancy'}
            onClick={handleSave}
            type="primary"
            width="fit"
            darkMode={isDark}
            loading={isPending || isSaving}
            disabled={isPending || isSaving}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddEditVacancyModal;
