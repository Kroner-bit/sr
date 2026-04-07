import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Igen',
  cancelText = 'Mégse',
  onConfirm,
  onCancel,
  isDestructive = true
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-cyan-500/10 text-cyan-400'}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <button 
              onClick={onCancel}
              className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">{title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        <div className="p-4 bg-zinc-950/50 border-t border-zinc-800/50 flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors active:scale-95 ${
              isDestructive 
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
                : 'bg-cyan-400 text-zinc-950 hover:bg-cyan-300'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
