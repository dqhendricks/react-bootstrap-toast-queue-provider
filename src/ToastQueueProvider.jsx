import { useState, createContext } from "react";

import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

const defaultProps = {
  position: "bottom-end",
  autohideDelay: 3000,
  maxToasts: 10,
};

// context provides createToast({ title, body, autohide = true, bg = undefined }) function
export const ToastQueueContext = createContext({
  createToast: () => {
    throw new Error(
      "createToast can only be used inside <ToastQueueContext.Provider>",
    );
  },
});

// wrap children in provider component, allowing them to use the context function
export function ToastQueueProvider(props) {
  const [queue, setQueue] = useState([]);
  const { children, position, autohideDelay, maxToasts } = {
    ...defaultProps,
    ...props,
  };

  // optional 'bg' property sets Bootstrap variant (primary, secondary, success, danger, warning, info, light, dark)
  function createToast(toastData) {
    if (queue.length >= maxToasts) return;
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
      <ToastContainer className="p-3" position={position}>
        {queue.map((toast) => (
          <Toast
            key={toast.id}
            show={toast.show}
            onClose={() => closeToast(toast.id)}
            onExited={() => removeToast(toast.id)}
            delay={autohideDelay}
            autohide={toast.autohide}
            bg={toast?.bg}
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