import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TugasTambahanDetailPage from '../pages/tambahan/TugasTambahanDetailPage';
import axios from 'axios';

jest.mock('axios');

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}));

const mockShowSuccess = jest.fn();
const mockConfirmDelete = jest.fn();
const mockShowError = jest.fn();
const mockHandleAxiosError = jest.fn((error, defaultMessage) => {
  const message = error?.response?.data?.message || defaultMessage;
  mockShowError('Error', message);
});

jest.mock('../utils/alerts', () => ({
  showSuccess: (...args) => mockShowSuccess(...args),
  confirmDelete: (...args) => mockConfirmDelete(...args),
  confirmCancel: jest.fn(),
  handleAxiosError: (...args) => mockHandleAxiosError(...args),
  showError: (...args) => mockShowError(...args),
  showWarning: jest.fn(),
}));

jest.mock('../pages/auth/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, role: 'ADMIN' } }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

test('renders fields in correct order with grid layout', async () => {
  axios.get.mockImplementation((url) => {
    if (url === '/tugas-tambahan/1') {
      return Promise.resolve({
        data: {
          kegiatanId: 1,
          userId: 1,
          tanggal: '2024-01-01',
          status: 'BELUM',
          nama: 'Test',
          deskripsi: 'Desc',
          kegiatan: { team: { namaTim: 'Tim A' } },
          tanggalSelesai: '2024-01-05',
          buktiLink: 'http://example.com',
        },
      });
    }
    if (url.startsWith('/master-kegiatan')) {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: [] });
  });

  render(<TugasTambahanDetailPage />);

  const grid = await screen.findByTestId('detail-grid');
  expect(grid).toHaveClass('grid', 'sm:grid-cols-2', 'lg:grid-cols-3');
  expect(grid.textContent).toMatch(
    /Kegiatan.*Tim.*Minggu.*Bulan.*Tahun.*Deskripsi Penugasan.*Status/s
  );
  expect(grid.textContent).not.toMatch(/Tanggal Selesai|Bukti/);
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.getByText('Januari')).toBeInTheDocument();
  expect(screen.getByText('2024')).toBeInTheDocument();
  expect(screen.getByText(/Tanggal Selesai/)).toBeInTheDocument();
  expect(screen.getAllByText(/Bukti/).length).toBeGreaterThan(0);
});

test('shows period text in edit mode based on selected date', async () => {
  axios.get.mockImplementation((url) => {
    if (url === '/tugas-tambahan/1') {
      return Promise.resolve({
        data: {
          kegiatanId: 1,
          userId: 1,
          tanggal: '2024-01-01',
          status: 'BELUM',
          nama: 'Test',
          kegiatan: { team: { namaTim: 'Tim A' } },
        },
      });
    }
    if (url.startsWith('/master-kegiatan')) {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: [] });
  });

  render(<TugasTambahanDetailPage />);

  const editButton = await screen.findByRole('button', { name: /edit/i });
  fireEvent.click(editButton);

  expect(
    await screen.findByLabelText(/periode/i)
  ).toHaveValue('Minggu ke-1 Bulan Januari Tahun 2024');
});

  test('navigates to list with success state after deletion', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/tugas-tambahan/1') {
        return Promise.resolve({
          data: {
            kegiatanId: 1,
            userId: 1,
            tanggal: '2024-01-01',
            status: 'BELUM',
            nama: 'Test',
            kegiatan: { team: { namaTim: 'Tim A' } },
          },
        });
      }
      if (url.startsWith('/master-kegiatan')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });
    axios.delete.mockResolvedValue({});
    mockConfirmDelete.mockResolvedValue({ isConfirmed: true });

    render(<TugasTambahanDetailPage />);
    const deleteButton = await screen.findByRole('button', { name: /hapus/i });

    fireEvent.click(deleteButton);

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/tugas-tambahan', {
        state: { success: 'Kegiatan dihapus' },
      })
    );
    expect(mockShowSuccess).not.toHaveBeenCalled();
  });

test('shows backend error message when deletion fails', async () => {
  const backendMessage = 'Backend error';

  axios.get.mockImplementation((url) => {
    if (url === '/tugas-tambahan/1') {
      return Promise.resolve({
        data: {
          kegiatanId: 1,
          userId: 1,
          tanggal: '2024-01-01',
          status: 'BELUM',
          nama: 'Test',
          kegiatan: { team: { namaTim: 'Tim A' } },
        },
      });
    }
    if (url.startsWith('/master-kegiatan')) {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: [] });
  });
  axios.delete.mockRejectedValue({
    response: { status: 400, data: { message: backendMessage } },
  });
  mockConfirmDelete.mockResolvedValue({ isConfirmed: true });

  render(<TugasTambahanDetailPage />);
  const deleteButton = await screen.findByRole('button', { name: /hapus/i });

  fireEvent.click(deleteButton);

  await waitFor(() =>
    expect(mockShowError).toHaveBeenCalledWith(
      'Gagal',
      'Harap hapus laporan harian terlebih dahulu!'
    )
  );
  expect(axios.delete).toHaveBeenCalledWith('/tugas-tambahan/1', {
    suppressToast: true,
  });
  expect(mockHandleAxiosError).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(mockShowSuccess).not.toHaveBeenCalled();
});

