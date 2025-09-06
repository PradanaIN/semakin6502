import { render, screen, waitFor } from '@testing-library/react';
import UsersPage from '../pages/users/UsersPage';
import { useAuth } from '../pages/auth/useAuth';
import axios from 'axios';

jest.mock('axios');
jest.mock('../pages/auth/useAuth');
jest.mock('../components/ui/DataTable', () => ({ data }) => (
  <div data-testid="data-table">{JSON.stringify(data)}</div>
));
jest.mock('../components/SearchInput', () => () => <div />);
jest.mock('../components/Pagination', () => () => <div />);
jest.mock('../components/ui/SelectDataShow', () => () => <div />);
jest.mock('../components/ui/TableSkeleton', () => () => <div />);

test('handles non-array responses from /users', async () => {
  useAuth.mockReturnValue({ user: { role: 'admin' } });
  axios.get.mockImplementation((url) => {
    if (url === '/users') return Promise.resolve({ data: {} });
    return Promise.resolve({ data: [] });
  });
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

  render(<UsersPage />);

  await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/users'));
  await waitFor(() => expect(screen.getByTestId('data-table').textContent).toBe('[]'));
  await waitFor(() => expect(warn).toHaveBeenCalledWith('Unexpected users response', {}));

  warn.mockRestore();
});
