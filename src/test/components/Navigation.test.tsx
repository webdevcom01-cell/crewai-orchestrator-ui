import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../testUtils';
import Navigation from '../../../components/Navigation';

describe('Navigation', () => {
  it('should render navigation links', () => {
    renderWithProviders(<Navigation />);

    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Run Simulation')).toBeInTheDocument();
  });

  it('should highlight active link', () => {
    renderWithProviders(<Navigation />);

    // Check if Agents link is active (default route)
    const agentsLink = screen.getByText('Agents').closest('a');
    expect(agentsLink).toHaveAttribute('aria-current', 'page');
  });

  it('should render menu button', () => {
    renderWithProviders(<Navigation />);

    // Menu button should be present
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    expect(menuButton).toBeInTheDocument();
  });
});
