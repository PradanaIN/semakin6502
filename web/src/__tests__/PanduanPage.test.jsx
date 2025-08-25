import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PanduanPage from '../pages/panduan/PanduanPage';

jest.mock('react-player', () => () => null);
jest.mock('react-pdf', () => ({
  Document: ({ children }) => <div>{children}</div>,
  Page: ({ pageNumber }) => (
    <div data-testid="pdf-page" data-page-number={pageNumber} />
  ),
  pdfjs: { GlobalWorkerOptions: {}, version: '1.0.0' },
}));

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
    screen.getByText(/Navigasi per bagian/i)
  ).toBeInTheDocument();

  const pdfPage = screen.getByTestId('pdf-page');

  // first section "Pendahuluan" should open the PDF on page 2
  fireEvent.click(screen.getByRole('button', { name: /Pendahuluan/i }));
  expect(pdfPage).toHaveAttribute('data-page-number', '2');

  // navigating to the Dashboard tab should update the page number
  fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
  expect(pdfPage).toHaveAttribute('data-page-number', '5');
});
