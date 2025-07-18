import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';
import { AuthProvider } from '../features/auth/hooks/useAuth';

beforeEach(() => {
  localStorage.clear();
});

test('renders login page at /login', async () => {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>
  );

  expect(await screen.findByText(/Masuk untuk melanjutkan/i)).toBeInTheDocument();
});
