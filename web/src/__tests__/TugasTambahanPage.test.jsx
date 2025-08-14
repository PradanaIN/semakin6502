import { render, waitFor } from '@testing-library/react';
import TugasTambahanPage from '../pages/tambahan/TugasTambahanPage';
import axios from 'axios';

jest.mock('axios');

const mockShowSuccess = jest.fn();

jest.mock('../utils/alerts', () => ({
  showSuccess: (...args) => mockShowSuccess(...args),
  handleAxiosError: jest.fn(),
  showWarning: jest.fn(),
  confirmCancel: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/tugas-tambahan', state: { success: 'Kegiatan dihapus' } }),
}));

jest.mock('../pages/auth/useAuth', () => ({
  useAuth: () => ({ user: { role: 'ADMIN', teamId: 1 } }),
}));

test('shows success toast when navigated with success state', async () => {
  axios.get.mockImplementation((url) => {
    if (url === '/tugas-tambahan') return Promise.resolve({ data: [] });
    if (url.startsWith('/master-kegiatan')) return Promise.resolve({ data: [] });
    if (url === '/teams/all') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });

  render(<TugasTambahanPage />);

  await waitFor(() =>
    expect(mockShowSuccess).toHaveBeenCalledWith('Dihapus', 'Kegiatan dihapus')
  );
  expect(mockNavigate).toHaveBeenCalledWith('/tugas-tambahan', { replace: true });
});
