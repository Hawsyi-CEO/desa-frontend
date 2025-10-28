import { useState } from 'react';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    show: false,
    title: 'Konfirmasi',
    message: '',
    confirmText: 'Ya',
    cancelText: 'Batal',
    confirmColor: 'blue',
    onConfirm: () => {},
  });

  const confirm = ({ 
    title = 'Konfirmasi', 
    message, 
    confirmText = 'Ya', 
    cancelText = 'Batal',
    confirmColor = 'blue'
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        show: true,
        title,
        message,
        confirmText,
        cancelText,
        confirmColor,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, show: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, show: false }));
          resolve(false);
        },
      });
    });
  };

  const hideConfirm = () => {
    setConfirmState(prev => ({ ...prev, show: false }));
  };

  return { confirm, confirmState, hideConfirm };
};
