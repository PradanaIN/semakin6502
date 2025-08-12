import { render, screen, fireEvent, act } from '@testing-library/react';
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

jest.mock('../utils/alerts', () => ({
  showSuccess: (...args) => mockShowSuccess(...args),
  confirmDelete: (...args) => mockConfirmDelete(...args),
  confirmCancel: jest.fn(),
  handleAxiosError: jest.fn(),
  showWarning: jest.fn(),
}));

jest.mock('../pages/auth/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, role: 'ADMIN' } }),
}));

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

test('shows success toast before navigating back', async () => {
  jest.useFakeTimers();

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
  await act(async () => {});

  expect(mockShowSuccess).toHaveBeenCalledWith('Dihapus', 'Kegiatan dihapus');
  expect(mockNavigate).not.toHaveBeenCalled();

  await act(async () => {
    jest.advanceTimersByTime(300);
  });

  expect(mockNavigate).toHaveBeenCalledWith(-1);
});

