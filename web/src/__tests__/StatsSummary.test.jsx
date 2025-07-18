import { render, screen } from '@testing-library/react';
import StatsSummary from '../features/dashboard/components/StatsSummary';

test('shows weekly summary statistics', () => {
  const data = {
    detail: [
      { tanggal: '2025-07-18', selesai: 3 },
    ],
    penugasan: { total: 5, selesai: 2, belum: 3 },
  };
  render(<StatsSummary weeklyData={data} />);
  expect(screen.getByText('3')).toBeInTheDocument(); // tugas hari ini
  expect(screen.getByText('5')).toBeInTheDocument(); // tugas minggu ini
  expect(screen.getByText('3')).toBeInTheDocument(); // belum selesai
  expect(screen.getByText('2')).toBeInTheDocument(); // selesai
});
