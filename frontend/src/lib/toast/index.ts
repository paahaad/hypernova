import { toast, Toaster, ToasterProps } from 'sonner';
export { ThemedToaster } from './toaster';

// Custom themed toast functions that match the app's aesthetic
export const themedToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: 'linear-gradient(to right, rgba(30,30,40,0.95), rgba(15,15,25,0.98))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.2)',
      },
      className: 'themed-toast text-green-500',
    });
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        background: 'linear-gradient(to right, rgba(30,30,40,0.95), rgba(15,15,25,0.98))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.2)',
      },
      className: 'themed-toast text-red-400',
    });
  },
  info: (message: string) => {
    toast(message, {
      style: {
        background: 'linear-gradient(to right, rgba(30,30,40,0.95), rgba(15,15,25,0.98))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.2)',
      },
      className: 'themed-toast text-blue-400',
    });
  },
  warning: (message: string) => {
    toast.warning(message, {
      style: {
        background: 'linear-gradient(to right, rgba(30,30,40,0.95), rgba(15,15,25,0.98))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.2)',
      },
      className: 'themed-toast text-amber-500',
    });
  },
  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: msgs.loading,
      success: msgs.success,
      error: msgs.error,
      style: {
        background: 'linear-gradient(to right, rgba(30,30,40,0.95), rgba(15,15,25,0.98))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.2)',
      },
      classNames: {
        loading: 'themed-toast text-blue-400',
        success: 'themed-toast text-green-500',
        error: 'themed-toast text-red-400',
      },
    });
  }
};

// Export the pre-configured Toaster properties
export const themedToasterProps: Partial<ToasterProps> = {
  position: "top-right",
  toastOptions: {
    duration: 4000,
    style: {
      background: 'linear-gradient(to right, rgba(30,30,40,0.95), rgba(15,15,25,0.98))',
      border: '1px solid rgba(139, 92, 246, 0.15)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.15)',
      borderRadius: '8px',
      backdropFilter: 'blur(8px)',
    },
    className: 'themed-toast',
  }
}; 