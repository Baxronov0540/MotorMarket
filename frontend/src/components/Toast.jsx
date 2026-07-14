import { useState, useEffect } from 'react';

let _toastId = 0;
let _setToasts = null;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;

  return (
    <>
      {children}
      <div className="toast-host">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}

export function toast(message, kind = 'info') {
  if (!_setToasts) return;
  const id = ++_toastId;
  _setToasts((prev) => [...prev, { id, message, kind }]);
  setTimeout(() => {
    _setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 3500);
}
