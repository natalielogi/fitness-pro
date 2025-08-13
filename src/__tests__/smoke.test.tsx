import { render, screen } from '@testing-library/react';

function Hello() {
  return <h1>SkyFitnessPro</h1>;
}

test('renders headline', () => {
  render(<Hello />);
  expect(screen.getByText('SkyFitnessPro')).toBeInTheDocument();
});
