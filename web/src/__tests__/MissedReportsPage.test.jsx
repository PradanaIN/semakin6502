import { render, screen } from '@testing-library/react';
import MissedReportsPage from '../pages/monitoring/MissedReportsPage';
import axios from 'axios';

jest.mock('axios');

test('shows last update note', async () => {
  axios.get.mockImplementation((url) => {
    if (url === '/monitoring/laporan/terlambat')
      return Promise.resolve({ data: { day1: [], day3: [], day7: [] } });
    if (url === '/monitoring/last-update')
      return Promise.resolve({ data: { lastUpdate: '2024-06-01T00:00:00.000Z' } });
    return Promise.resolve({ data: [] });
  });
  render(<MissedReportsPage />);
  expect(await screen.findByText(/Data terakhir diperbarui/i)).toBeInTheDocument();
});
