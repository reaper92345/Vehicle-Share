"use client";

import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface AdminModalProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminModal({ title, children, isOpen, onClose }: AdminModalProps) {
  // Ensure a portal root; fallback to body
  const modalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') ?? document.body : null;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !modalRoot) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 max-w-full glassmorphism"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h2>
        {children}
      </div>
    </div>,
    modalRoot
  );
}
