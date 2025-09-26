import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/dashboard/Dashboard';
import { useAuth } from '../pages/auth/useAuth';
import axios from 'axios';
import { STATUS } from '../utils/status';

jest.mock('axios');
jest.mock('../pages/auth/useAuth');
jest.mock('../pages/dashboard/components/StatsSummary', () => () => <div />);
jest.mock('../pages/dashboard/components/MonitoringTabs', () => {
  // eslint-disable-next-line no-undef
  const React = require('react');
  // eslint-disable-next-line no-undef
  const DailyOverview = require('../pages/dashboard/components/DailyOverview').default;
  return ({ dailyData }) => <DailyOverview data={dailyData} />;
});
jest.mock('recharts', () => {
  // eslint-disable-next-line no-undef
  // eslint-disable-next-line no-unused-vars
  const React = require('react');
  const createElement = (role) => ({ children, ...props }) => (
    <div data-mock-role={role} {...props}>
      {children}
    </div>
  );

  return {
    ResponsiveContainer: createElement('ResponsiveContainer'),
    LineChart: createElement('LineChart'),
    Line: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    XAxis: () => null,
    YAxis: () => null,
  };
});

const mockedUseAuth = useAuth;

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date('2024-04-15T00:00:00.000Z'));
});

afterAll(() => {
  jest.useRealTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

test('dates with reports appear green', async () => {
  mockedUseAuth.mockReturnValue({ user: { role: 'anggota' } });
  axios.get.mockImplementation((url) => {
    if (url === '/monitoring/harian') {
      return Promise.resolve({
        data: [{ tanggal: '2024-04-02T00:00:00.000Z', adaKegiatan: true }],
      });
    }
    if (url === '/monitoring/mingguan') {
      return Promise.resolve({
        data: {
          tanggal: '2024-04-01 - 2024-04-07',
          detail: [],
          totalSelesai: 0,
          totalTugas: 0,
          totalProgress: 0,
        },
      });
    }
    if (url === '/monitoring/bulanan') {
      return Promise.resolve({ data: [] });
    }
    if (url === '/monitoring/penugasan/minggu') {
      return Promise.resolve({ data: {} });
    }
    return Promise.resolve({ data: [] });
  });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  const dayText = await screen.findByText(/02 April 2024/);
  const dayBox = dayText.parentElement;
  expect(dayBox).toHaveClass('bg-green-100');
});

test('admin sees strategic management dashboard', async () => {
  mockedUseAuth.mockReturnValue({ user: { role: 'admin', nama: 'Admin' } });
  axios.get.mockImplementation((url) => {
    if (url === '/teams/all') {
      return Promise.resolve({
        data: [
          {
            id: 1,
            namaTim: 'Tim A',
            members: [{ user: { id: 10, nama: 'Pegawai A', role: 'anggota' } }],
          },
        ],
      });
    }
    if (url === '/penugasan') {
      return Promise.resolve({
        data: [
          {
            id: 1,
            kegiatan: { namaKegiatan: 'Project Strategis' },
            status: STATUS.BELUM,
            pegawaiId: 10,
          },
          {
            id: 2,
            kegiatan: { namaKegiatan: 'Project Strategis' },
            status: STATUS.SELESAI_DIKERJAKAN,
            pegawaiId: 10,
          },
        ],
      });
    }
    if (url === '/monitoring/mingguan/all') {
      return Promise.resolve({ data: [{ userId: 10, total: 5, selesai: 3 }] });
    }
    if (url === '/monitoring/bulanan/all') {
      return Promise.resolve({ data: [{ userId: 10, total: 20, selesai: 15 }] });
    }
    if (url === '/monitoring/bulanan/matrix') {
      return Promise.resolve({
        data: [
          {
            userId: 10,
            months: Array.from({ length: 12 }, () => ({ persen: 70 })),
          },
        ],
      });
    }
    return Promise.resolve({ data: [] });
  });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Dashboard Strategis/i)).toBeInTheDocument();
  expect(await screen.findByText(/Project Strategis/)).toBeInTheDocument();
  expect(await screen.findByTestId('trends-chart')).toBeInTheDocument();
});

test('shows skeleton placeholder when trend data is unavailable', async () => {
  mockedUseAuth.mockReturnValue({ user: { role: 'admin', nama: 'Admin' } });
  axios.get.mockImplementation((url) => {
    if (url === '/teams/all') {
      return Promise.resolve({ data: [] });
    }
    if (url === '/penugasan') {
      return Promise.resolve({ data: [] });
    }
    if (url === '/monitoring/mingguan/all') {
      return Promise.resolve({ data: [] });
    }
    if (url === '/monitoring/bulanan/all') {
      return Promise.resolve({ data: [] });
    }
    if (url === '/monitoring/bulanan/matrix') {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: [] });
  });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(await screen.findByTestId('trends-skeleton')).toBeInTheDocument();
});

