import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../pages/layout/Sidebar';
import { useAuth } from '../pages/auth/useAuth';

jest.mock('../pages/auth/useAuth');

const mockedUseAuth = useAuth;

describe('Sidebar role visibility', () => {
  test('pimpinan sees only monitoring related links', () => {
    mockedUseAuth.mockReturnValue({ user: { role: 'pimpinan' } });
    render(
      <MemoryRouter>
        <Sidebar setSidebarOpen={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Monitoring/i)).toBeInTheDocument();
    expect(screen.getByText(/Keterlambatan/i)).toBeInTheDocument();
    expect(screen.getByText(/Tugas Mingguan/i)).toBeInTheDocument();
    expect(screen.getByText(/Tugas Tambahan/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Pegawai/i)).toBeInTheDocument();
    expect(screen.queryByText(/Dashboard/i)).toBeNull();
    expect(screen.queryByText(/Laporan Harian/i)).toBeNull();
    expect(screen.queryByText(/Master Kegiatan/i)).toBeNull();
    expect(screen.queryByText(/Kelola Pengguna/i)).toBeNull();
    expect(screen.queryByText(/Kelola Tim/i)).toBeNull();
  });

  test('ketua sees all main links', () => {
    mockedUseAuth.mockReturnValue({ user: { role: 'ketua' } });
    render(
      <MemoryRouter>
        <Sidebar setSidebarOpen={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Tugas Mingguan/i)).toBeInTheDocument();
    expect(screen.getByText(/Tugas Tambahan/i)).toBeInTheDocument();
    expect(screen.getByText(/Laporan Harian/i)).toBeInTheDocument();
    expect(screen.getByText(/Master Kegiatan/i)).toBeInTheDocument();
    expect(screen.getByText(/Monitoring/i)).toBeInTheDocument();
    expect(screen.getByText(/Keterlambatan/i)).toBeInTheDocument();
  });
});
