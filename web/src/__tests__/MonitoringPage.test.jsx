import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MonitoringPage from '../pages/monitoring/MonitoringPage';
import { useAuth } from '../pages/auth/useAuth';
import axios from 'axios';
import { showWarning } from '../utils/alerts';

jest.mock('axios');
jest.mock('../pages/monitoring/components/FilterToolbar', () => () => <div />);
jest.mock('../pages/monitoring/components/TabNavigation', () => () => <div />);
jest.mock('../pages/monitoring/components/TabContent', () => () => <div />);
jest.mock('../pages/auth/useAuth');
jest.mock('../utils/alerts', () => ({
  handleAxiosError: jest.fn(),
  showWarning: jest.fn(),
}));

const mockedUseAuth = useAuth;
const mockedShowWarning = showWarning;

test('displays last update note', async () => {
  mockedUseAuth.mockReturnValue({ user: { role: 'admin' } });
  axios.get.mockImplementation((url) => {
    if (url === '/monitoring/last-update')
      return Promise.resolve({ data: { lastUpdate: '2024-06-01T00:00:00.000Z' } });
    if (url === '/teams/all') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });
  render(
    <MemoryRouter>
      <MonitoringPage />
    </MemoryRouter>
  );
  expect(
    await screen.findByText(
      (_, el) =>
        el.textContent ===
        'Data diambil pada Sabtu, 1 Juni 2024 pukul 08:00:00 WITA'
    )
  ).toBeInTheDocument();
});

test('handles invalid team response gracefully', async () => {
  mockedUseAuth.mockReturnValue({ user: { role: 'admin' } });
  axios.get.mockImplementation((url) => {
    if (url === '/monitoring/last-update')
      return Promise.resolve({ data: { lastUpdate: '2024-06-01T00:00:00.000Z' } });
    if (url === '/teams/all') return Promise.resolve({ data: '<html></html>' });
    return Promise.resolve({ data: [] });
  });
  render(
    <MemoryRouter>
      <MonitoringPage />
    </MemoryRouter>
  );
  expect(await screen.findByText('Daftar Laporan Harian')).toBeInTheDocument();
  expect(mockedShowWarning).toHaveBeenCalled();
});
