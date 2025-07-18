import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import { AuthProvider } from '../features/auth/hooks/useAuth';

function renderPage() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
}

test('renders login form', () => {
  renderPage();
  expect(screen.getByLabelText(/Email atau Username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Password/i, { selector: 'input' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
});

test('can toggle password visibility', async () => {
  renderPage();
  const password = screen.getByLabelText(/Password/i, { selector: 'input' });
  expect(password).toHaveAttribute('type', 'password');
  const toggle = screen.getByLabelText(/Lihat Password/i);
  await userEvent.click(toggle);
  expect(password).toHaveAttribute('type', 'text');
});
