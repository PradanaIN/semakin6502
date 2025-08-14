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
    toastError: false,
  });
  expect(mockHandleAxiosError).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(mockShowSuccess).not.toHaveBeenCalled();
});

