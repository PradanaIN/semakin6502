import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';
import { AuthProvider } from '../pages/auth/useAuth';
import { HelmetProvider } from 'react-helmet-async';

beforeEach(() => {
  localStorage.clear();
});

test('renders login page at /login', async () => {
  render(
    <HelmetProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>
    </HelmetProvider>
  );

  // shows loading fallback while lazy component loads
  expect(screen.getByText(/Sabar, ambil nafas dulu/i)).toBeInTheDocument();

  expect(await screen.findByText(/Masuk untuk melanjutkan/i)).toBeInTheDocument();
});
