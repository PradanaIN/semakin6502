import { render, screen } from '@testing-library/react';
import MonitoringPage from '../pages/monitoring/MonitoringPage';
import { useAuth } from '../pages/auth/useAuth';
import axios from 'axios';

jest.mock('axios');
jest.mock('../pages/monitoring/components/FilterToolbar', () => () => <div />);
jest.mock('../pages/monitoring/components/TabNavigation', () => () => <div />);
jest.mock('../pages/monitoring/components/TabContent', () => () => <div />);
jest.mock('../pages/auth/useAuth');

const mockedUseAuth = useAuth;

test('displays last update note', async () => {
  mockedUseAuth.mockReturnValue({ user: { role: 'admin' } });
  axios.get.mockImplementation((url) => {
    if (url === '/monitoring/last-update')
      return Promise.resolve({ data: { lastUpdate: '2024-06-01T00:00:00.000Z' } });
    if (url === '/teams/all') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });
  render(<MonitoringPage />);
  expect(
    await screen.findByText(
      (_, el) =>
        el.textContent ===
        'Data terakhir diperbarui: 1 Juni 2024 pukul 08.00.00 WITA'
    )
  ).toBeInTheDocument();
});
