import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'info':
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default:
        return {
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <ExclamationTriangleIcon className={`h-6 w-6 ${styles.iconColor}`} />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={styles.confirmButton}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}