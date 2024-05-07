import { useState, createContext } from "react";

import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

// context provides addNewToast(title, body, autohide = true, variation = null) function
export const ToastQueueContext = createContext();

const DEFAULT_DURATION = 3000;
const MAX_TOASTS = 10;

// wrap children in provider component, allowing them to use the context function
export default function ToastQueueProvider({ children }) {
  const [queue, setQueue] = useState([]);

  // optional 'variation' argument sets Bootstrap bg color (primary, secondary, success, danger, warning, info, light, dark)
  function addNewToast(title, body, autohide = true, variation = null) {
    if (queue.length >= MAX_TOASTS) return;
    setQueue((currentQueue) => [
      ...currentQueue,
      {
        id: Date.now(),
        show: true,
        title: title,
        body: body,
        variation: variation,
        autohide: autohide,
      },
    ]);
  }

  // begins toast close animation
  function closeToast(id) {
    setQueue((currentQueue) =>
      currentQueue.map((toast) =>
        toast.id === id ? { ...toast, show: false } : toast
      )
    );
  }

  // removes toast from queue once close animation complete
  function removeToast(id) {
    setQueue((currentQueue) => currentQueue.filter((toast) => toast.id !== id));
  }

  return (
    <ToastQueueContext.Provider value={{ addNewToast: addNewToast }}>
      {children}
      <ToastContainer
        className="p-3"
        position="bottom-end"
        style={{ zIndex: 1 }}
      >
        {queue.map((toast) => (
          <Toast
            key={toast.id}
            show={toast.show}
            onClose={() => closeToast(toast.id)}
            onExited={() => removeToast(toast.id)}
            delay={DEFAULT_DURATION}
            bg={toast.variation}
            autohide={toast.autohide}
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
