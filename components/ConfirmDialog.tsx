import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-gray-100 w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-primary-600'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-md transition-all ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                : 'bg-primary-500 hover:bg-primary-600 shadow-cta'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
