import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from '../pages/layout/Layout';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from '../pages/auth/useAuth';
import { useTheme } from '../theme/useTheme.jsx';
import axios from 'axios';

jest.mock('../pages/auth/useAuth');
jest.mock('../theme/useTheme.jsx');
jest.mock('axios');
jest.mock('../utils/confirmAlert', () => jest.fn());

describe('Layout', () => {
  const mockedUseAuth = useAuth;
  const mockedUseTheme = useTheme;
  const toggleTheme = jest.fn();

  beforeEach(() => {
    mockedUseAuth.mockReturnValue({ user: { nama: 'Tester', role: 'admin' }, setUser: jest.fn() });
    mockedUseTheme.mockReturnValue({ theme: 'light', toggleTheme });
    axios.get.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and toggles dark mode', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<div />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => expect(document.title).toContain('Dashboard'));

    const toggle = screen.getByLabelText(/toggle dark mode/i);
    fireEvent.click(toggle);
    expect(toggleTheme).toHaveBeenCalled();
  });
});
