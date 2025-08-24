import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PanduanPage from '../pages/panduan/PanduanPage';

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
  expect(pdfObject).toHaveAttribute('data', expect.stringContaining('#page=1'));

  fireEvent.click(screen.getByRole('button', { name: /Workflow/i }));
  expect(pdfObject).toHaveAttribute('data', expect.stringContaining('#page=3'));
});
