import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/dashboard/Dashboard';
import { useAuth } from '../pages/auth/useAuth';
import axios from 'axios';

jest.mock('axios');
jest.mock('../pages/auth/useAuth');
jest.mock('../pages/dashboard/components/StatsSummary', () => () => <div />);
jest.mock('../pages/dashboard/components/MonitoringTabs', () => {
  const React = require('react');
  const DailyOverview = require('../pages/dashboard/components/DailyOverview').default;
  return ({ dailyData }) => <DailyOverview data={dailyData} />;
});

const mockedUseAuth = useAuth;

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date('2024-04-15T00:00:00.000Z'));
});

afterAll(() => {
  jest.useRealTimers();
});

test('dates with reports appear green', async () => {
  mockedUseAuth.mockReturnValue({ user: { role: 'admin' } });
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

