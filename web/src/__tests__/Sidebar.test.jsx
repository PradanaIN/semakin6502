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
    expect(screen.getByText(/Monitoring/i)).toBeVisible();
    expect(screen.getByText(/Keterlambatan/i)).toBeVisible();
    expect(screen.getByText(/Tugas Mingguan/i)).toBeVisible();
    expect(screen.getByText(/Tugas Tambahan/i)).toBeVisible();
    expect(screen.getByText(/Data Pegawai/i)).toBeVisible();
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Laporan Harian/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Master Kegiatan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kelola Pengguna/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kelola Tim/i)).not.toBeInTheDocument();
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

  test.each([
    ['ketua'],
    ['anggota'],
  ])('role %s has a separator between Monitoring and Keterlambatan', (role) => {
    mockedUseAuth.mockReturnValue({ user: { role } });
    render(
      <MemoryRouter>
        <Sidebar setSidebarOpen={() => {}} />
      </MemoryRouter>
    );

    const monitoringLink = screen.getByText(/Monitoring/i).closest('a');
    const terlambatLink = screen.getByText(/Keterlambatan/i).closest('a');
    const separator = monitoringLink.nextElementSibling;

    expect(separator).toBeInstanceOf(HTMLHRElement);
    expect(separator).toBe(terlambatLink.previousElementSibling);
  });
});
