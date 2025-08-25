import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

const computeDate = (minggu, bulan, tahun) => {
  const firstOfMonth = new Date(tahun, bulan - 1, 1);
  const firstMonday = new Date(firstOfMonth);
  firstMonday.setDate(
    firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7)
  );
  const result = new Date(firstMonday);
  result.setDate(result.getDate() + (minggu - 1) * 7);
  return result.toISOString().slice(0, 10);
};

afterEach(() => {
  jest.clearAllMocks();
});

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

test('submits correct payload using period fields', async () => {
  mockUseLocation.mockReturnValue({ pathname: '/tugas-tambahan', state: null });
  axios.get.mockImplementation((url) => {
    if (url === '/tugas-tambahan/all') return Promise.resolve({ data: [] });
    if (url === '/master-kegiatan?limit=1000') return Promise.resolve({ data: [] });
    if (url === '/teams/all')
      return Promise.resolve({ data: [{ id: 1, namaTim: 'Tim A' }] });
    if (url === '/master-kegiatan?team=1')
      return Promise.resolve({ data: { data: [{ id: 1, namaKegiatan: 'Keg A' }] } });
    return Promise.resolve({ data: [] });
  });
  axios.post.mockResolvedValue({});

  render(<TugasTambahanPage />);
  await waitFor(() => expect(axios.get).toHaveBeenCalled());

  fireEvent.click(screen.getByRole('button', { name: /tugas tambahan/i }));

  await screen.findByLabelText(/Tim/);
  fireEvent.change(screen.getByLabelText(/Tim/), { target: { value: '1' } });
  await waitFor(() =>
    expect(axios.get).toHaveBeenCalledWith('/master-kegiatan?team=1')
  );
  fireEvent.change(screen.getByLabelText(/^Kegiatan/), {
    target: { value: '1' },
  });
  fireEvent.change(screen.getByLabelText(/Minggu/), {
    target: { value: '2' },
  });
  fireEvent.change(screen.getByLabelText(/Bulan/), {
    target: { value: '5' },
  });
  fireEvent.change(screen.getByLabelText(/Tahun/), {
    target: { value: '2024' },
  });
  fireEvent.change(screen.getByLabelText(/Deskripsi Kegiatan/), {
    target: { value: 'desc' },
  });

  fireEvent.click(screen.getByRole('button', { name: /simpan/i }));

  const expectedDate = computeDate(2, 5, 2024);

  expect(axios.post).toHaveBeenCalledWith(
    '/tugas-tambahan',
    expect.objectContaining({
      kegiatanId: '1',
      deskripsi: 'desc',
      status: 'BELUM',
      tanggal: expectedDate,
    })
  );
});
