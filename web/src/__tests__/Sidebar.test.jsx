import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../pages/layout/Sidebar';
import { useAuth } from '../pages/auth/useAuth';

jest.mock('../pages/auth/useAuth');

const mockedUseAuth = useAuth;

describe('Sidebar menu structure', () => {
  test.each([
    ['admin'],
    ['pimpinan'],
    ['ketua'],
    ['anggota'],
  ])('role %s sees Panduan link', (role) => {
    mockedUseAuth.mockReturnValue({ user: { role } });
    render(
      <MemoryRouter>
        <Sidebar setSidebarOpen={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Panduan/i)).toBeVisible();
  });

  test('admin sees sections in order with dividers', () => {
    mockedUseAuth.mockReturnValue({ user: { role: 'admin' } });
    render(
      <MemoryRouter>
        <Sidebar setSidebarOpen={() => {}} />
      </MemoryRouter>
    );

    const nav = screen.getByRole('navigation');
    const linkTexts = Array.from(nav.querySelectorAll('a')).map(
      (a) => a.textContent
    );
    expect(linkTexts).toEqual([
      'Dashboard',
      'Tugas Mingguan',
      'Tugas Tambahan',
      'Laporan Harian',
      'Monitoring',
      'Keterlambatan',
      'Master Kegiatan',
      'Kelola Pengguna',
      'Kelola Tim',
      'Panduan',
    ]);

    const dataPegawaiHeading = screen.getByText('Data Pegawai');
    const monitoringHeading = screen.getByText('Monitoring', { selector: 'div' });
    const masterHeading = screen.getByText('Master');
    const lainnyaHeading = screen.getByText('Lainnya');

    expect(dataPegawaiHeading.previousElementSibling).toBeInstanceOf(
      HTMLHRElement
    );
    expect(monitoringHeading.previousElementSibling).toBeInstanceOf(
      HTMLHRElement
    );
    expect(masterHeading.previousElementSibling).toBeInstanceOf(HTMLHRElement);
    expect(lainnyaHeading.previousElementSibling).toBeInstanceOf(HTMLHRElement);
  });

  test('pimpinan sees monitoring first then sections', () => {
    mockedUseAuth.mockReturnValue({ user: { role: 'pimpinan' } });
    render(
      <MemoryRouter>
        <Sidebar setSidebarOpen={() => {}} />
      </MemoryRouter>
    );

    const nav = screen.getByRole('navigation');
    const linkTexts = Array.from(nav.querySelectorAll('a')).map(
      (a) => a.textContent
    );
    expect(linkTexts).toEqual([
      'Monitoring',
      'Keterlambatan',
      'Tugas Mingguan',
      'Tugas Tambahan',
      'Panduan',
    ]);

    const dataPegawaiHeading = screen.getByText('Data Pegawai');
    const lainnyaHeading = screen.getByText('Lainnya');

    expect(dataPegawaiHeading.previousElementSibling).toBeInstanceOf(
      HTMLHRElement
    );
    expect(lainnyaHeading.previousElementSibling).toBeInstanceOf(
      HTMLHRElement
    );

    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Laporan Harian/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Master Kegiatan/i)).not.toBeInTheDocument();
  });
});

