import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';

type RenderStrategy = () => void;

describe('Home Page', () => {
  const renderHomePage: RenderStrategy = () => {
    render(<Page />);
  };

  it('should render the page without crashing', () => {
    renderHomePage();
    expect(document.body).toBeInTheDocument();
  });

  it('should render Next.js logo', () => {
    renderHomePage();
    const nextLogo = screen.getByRole('img', { name: /next\.js logo/i });
    expect(nextLogo).toBeInTheDocument();
  });

  it('should render main heading', () => {
    renderHomePage();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    renderHomePage();
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should have proper page structure', () => {
    renderHomePage();
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex', 'min-h-screen', 'flex-col', 'items-center', 'justify-between', 'p-24');
  });
});
