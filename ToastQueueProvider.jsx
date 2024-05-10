import { useState, createContext } from "react";

import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

// context provides createToast({ title, body, autohide = true, variant = null }) function
export const ToastQueueContext = createContext({
  createToast: () => {
    throw new Error(
      "createToast can only be used inside <ToastQueueContext.Provider>",
    );
  },
});

const TOAST_POSITION = "top-end";
const DEFAULT_DURATION = 3000;
const MAX_TOASTS = 10;

// wrap children in provider component, allowing them to use the context function
export default function ToastQueueProvider({ children }) {
  const [queue, setQueue] = useState([]);

  // optional 'variant' property sets Bootstrap bg color (primary, secondary, success, danger, warning, info, light, dark)
  function createToast(toastData) {
    if (queue.length >= MAX_TOASTS) return;
    setQueue((currentQueue) => [
      ...currentQueue,
      {
        id: Date.now(),
        show: true,
        autohide: true, // this default gets overwritten if set in toastData
        ...toastData,
      },
    ]);
  }

  // begins toast close animation
  function closeToast(id) {
    setQueue((currentQueue) =>
      currentQueue.map((toast) =>
        toast.id === id ? { ...toast, show: false } : toast,
      ),
    );
  }

  // removes toast from queue once close animation complete
  function removeToast(id) {
    setQueue((currentQueue) => currentQueue.filter((toast) => toast.id !== id));
  }

  return (
    <ToastQueueContext.Provider value={{ createToast }}>
      {children}
      <ToastContainer className="p-3" position={TOAST_POSITION}>
        {queue.map((toast) => (
          <Toast
            key={toast.id}
            show={toast.show}
            onClose={() => closeToast(toast.id)}
            onExited={() => removeToast(toast.id)}
            delay={DEFAULT_DURATION}
            autohide={toast.autohide}
            bg={toast?.variant}
          >
            <Toast.Header>
              <strong className="me-auto">{toast.title}</strong>
            </Toast.Header>
            <Toast.Body>{toast.body}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastQueueContext.Provider>
  );
}
