import { render, screen } from '@testing-library/react';
import DailyMatrix from '../pages/monitoring/DailyMatrix';
import { useAuth } from '../pages/auth/useAuth';

jest.mock('../pages/auth/useAuth');

const mockedUseAuth = useAuth;

it('centers day cells', () => {
  mockedUseAuth.mockReturnValue({ user: null });
  const data = [
    {
      userId: 1,
      nama: 'User 1',
      detail: [
        { tanggal: '2024-04-01T00:00:00.000Z', count: 1 }
      ]
    }
  ];
  render(<DailyMatrix data={data} monthIndex={3} year={2024} />);
  const cell = screen.getByRole('cell', { name: '1' });
  expect(cell).toHaveClass('text-center');
});
