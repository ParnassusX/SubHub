// Budget Action Buttons Component
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface BudgetActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  disabled?: boolean;
}

const BudgetActionButtons: React.FC<BudgetActionButtonsProps> = ({
  onSave,
  onCancel,
  onReset,
  isSaving,
  hasChanges,
  disabled = false
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
      {/* Primary Actions */}
      <div className="flex space-x-3">
        {/* Save Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={disabled || isSaving || !hasChanges}
          className={`
            px-4 py-2 rounded-md font-medium text-sm transition-colors
            ${hasChanges && !disabled && !isSaving
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
            ${isSaving ? 'opacity-75' : ''}
          `}
        >
          {isSaving ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{t('saving')}</span>
            </div>
          ) : (
            t('save')
          )}
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled || isSaving || !hasChanges}
          className={`
            px-4 py-2 rounded-md font-medium text-sm transition-colors
            ${hasChanges && !disabled && !isSaving
              ? 'bg-gray-600 hover:bg-gray-700 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {t('cancel')}
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex space-x-3">
        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          disabled={disabled || isSaving}
          className={`
            px-4 py-2 rounded-md font-medium text-sm transition-colors
            border border-red-600/50 text-red-400 hover:bg-red-900/20
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {t('resetBudget')}
        </button>
      </div>

      {/* Status Messages */}
      <div className="flex-1 text-right">
        {hasChanges && !isSaving && (
          <p className="text-xs text-yellow-400">
            {t('unsavedChanges')}
          </p>
        )}
        
        {!hasChanges && !isSaving && (
          <p className="text-xs text-gray-500">
            {t('allChangesSaved')}
          </p>
        )}
      </div>
    </div>
  );
};

export default BudgetActionButtons;
