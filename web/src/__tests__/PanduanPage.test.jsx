import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PanduanPage from '../pages/panduan/PanduanPage';

jest.mock('react-player', () => () => null);

test('renders PanduanPage elements', () => {
  render(
    <MemoryRouter>
      <PanduanPage />
    </MemoryRouter>
  );

  expect(
    screen.getByRole('heading', { name: /Panduan Penggunaan/i })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Pelajari alur kerja dan menu aplikasi./i)
  ).toBeInTheDocument();

  const pdfObject = screen.getByTitle('Buku Panduan');

  // first section "Pendahuluan" should open the PDF on page 2
  fireEvent.click(screen.getByRole('button', { name: /Pendahuluan/i }));
  expect(pdfObject).toHaveAttribute('data', expect.stringContaining('#page=2'));

  // navigating to the Dashboard tab should update the page anchor
  fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
  expect(pdfObject).toHaveAttribute('data', expect.stringContaining('#page=5'));
});
