// Simple confirmation modal
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
      onClick={onCancel}
    >
      <div
        className="rounded-lg shadow-xl w-full max-w-md m-4 border border-border-light"
        style={{ backgroundColor: '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-card-header border-b border-border-light">
          <AlertTriangle
            className={`w-5 h-5 ${
              variant === 'danger' 
                ? 'text-accent-red' 
                : variant === 'info'
                ? 'text-accent-blue'
                : 'text-warning'
            }`}
          />
          <h2 className="text-base font-semibold text-text-primary flex-1">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-control-hover rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-border-light bg-card-header">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md text-white transition-colors"
            style={{ 
              backgroundColor: variant === 'danger' ? '#ef4444' : '#f59e0b',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
