import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    if (url === '/teams') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

  render(<UsersPage />);

  await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/users'));
  await waitFor(() => expect(screen.getByTestId('data-table').textContent).toBe('[]'));
  await waitFor(() => expect(warn).toHaveBeenCalledWith('Unexpected users response', {}));

  warn.mockRestore();
});

test('handles non-array responses from /roles', async () => {
  useAuth.mockReturnValue({ user: { role: 'admin' } });
  axios.get.mockImplementation((url) => {
    if (url === '/roles') return Promise.resolve({ data: {} });
    if (url === '/teams') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

  render(<UsersPage />);

  await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/roles'));

  const select = await screen.findByRole('combobox');
  expect(within(select).getAllByRole('option')).toHaveLength(1);

  await waitFor(() => expect(warn).toHaveBeenCalledWith('Unexpected roles response', {}));

  warn.mockRestore();
});

test('fetches teams and shows team dropdown', async () => {
  useAuth.mockReturnValue({ user: { role: 'admin' } });
  axios.get.mockImplementation((url) => {
    if (url === '/teams') return Promise.resolve({ data: [{ id: '1', namaTim: 'Team A' }] });
    return Promise.resolve({ data: [] });
  });

  render(<UsersPage />);

  await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/teams'));

  await userEvent.click(screen.getByRole('button', { name: /Tambah Pengguna/i }));
  const select = await screen.findByLabelText('Tim');
  expect(within(select).getAllByRole('option')).toHaveLength(2);
});
