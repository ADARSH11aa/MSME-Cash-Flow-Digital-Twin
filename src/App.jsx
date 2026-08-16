import { RouterProvider } from 'react-router-dom';
import router from '@/routes/router';
import { ToastProvider } from '@/components/shared/Toast';

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
