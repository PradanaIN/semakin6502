import { render, screen, waitFor } from '@testing-library/react';
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
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

jest.mock('../pages/auth/useAuth', () => ({
  useAuth: () => ({ user: { role: 'ADMIN', teamId: 1 } }),
}));

let capturedColumns = [];
jest.mock('../components/ui/DataTable', () => ({
  __esModule: true,
  default: ({ columns, data }) => {
    capturedColumns = columns;
    return <div data-testid="data-table" />;
  },
}));

import TugasTambahanPage from '../pages/tambahan/TugasTambahanPage';

test('shows success toast when navigated with success state', async () => {
  mockUseLocation.mockReturnValue({
    pathname: '/tugas-tambahan',
    state: { success: 'Kegiatan dihapus' },
  });
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

test('renders detail button with icon variant', async () => {
  mockUseLocation.mockReturnValue({ pathname: '/tugas-tambahan', state: null });
  axios.get.mockImplementation((url) => {
    if (url === '/tugas-tambahan/all')
      return Promise.resolve({
        data: [
          {
            id: 1,
            nama: 'Test',
            kegiatan: { team: { namaTim: 'Tim A' } },
            tanggal: new Date().toISOString().slice(0, 10),
            deskripsi: 'Desc',
            status: 'BELUM',
            teamId: 1,
          },
        ],
      });
    if (url.startsWith('/master-kegiatan')) return Promise.resolve({ data: [] });
    if (url === '/teams/all') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });

  render(<TugasTambahanPage />);
  await waitFor(() => expect(axios.get).toHaveBeenCalled());

  const aksiCol = capturedColumns.find((c) => c.Header === 'Aksi');
  const { getByRole } = render(
    aksiCol.Cell({ row: { original: { id: 1 } } })
  );
  const detailBtn = getByRole('button', { name: /detail/i });
  expect(detailBtn).toBeInTheDocument();
  expect(detailBtn).toHaveClass('text-blue-600');
});
