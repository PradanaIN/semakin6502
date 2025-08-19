import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from '../pages/layout/Layout';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from '../pages/auth/useAuth';
import { useTheme } from '../theme/useTheme.jsx';
import axios from 'axios';

jest.mock('../pages/auth/useAuth');
jest.mock('../theme/useTheme.jsx');
jest.mock('axios');

describe('notification navigation', () => {
  test('clicking notification opens tugas mingguan detail page', async () => {
    useAuth.mockReturnValue({ user: { role: 'anggota' }, setUser: jest.fn() });
    useTheme.mockReturnValue({ theme: 'light', toggleTheme: jest.fn() });
    axios.get.mockResolvedValue({
      data: [
        { id: 1, text: 'Notif', link: '/tugas-mingguan/42', isRead: false },
      ],
    });
    axios.post.mockResolvedValue({});

    const user = userEvent.setup();

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route
                path="tugas-mingguan/:id"
                element={<div>Detail tugas mingguan</div>}
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const bell = screen.getByLabelText('Notifications', { selector: 'button' });
    await user.click(bell);
    const notifItem = await screen.findByText('Notif');
    await user.click(notifItem);

    expect(
      await screen.findByText(/Detail tugas mingguan/i)
    ).toBeInTheDocument();
  });
});
