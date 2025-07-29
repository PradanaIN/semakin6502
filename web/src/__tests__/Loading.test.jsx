import { render, screen } from '@testing-library/react';
import Loading from '../components/Loading';

it('renders default loading message', () => {
  render(<Loading />);
  expect(screen.getByText(/Sabar, ambil nafas dulu/i)).toBeInTheDocument();
});

it('supports custom message and size', () => {
  const { container } = render(<Loading message="Please wait" size="h-8 w-8" />);
  expect(screen.getByText(/Please wait/i)).toBeInTheDocument();
  const svg = container.querySelector('svg');
  expect(svg).toHaveClass('h-8 w-8');
});
