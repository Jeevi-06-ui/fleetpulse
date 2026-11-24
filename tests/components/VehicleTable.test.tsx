import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FleetProvider } from '@/context/FleetContext';
import { VehicleTable } from '@/components/fleet/VehicleTable';

describe('Component: VehicleTable', () => {
  it('renders vehicles and responds to search filtering', () => {
    render(
      <FleetProvider>
        <VehicleTable />
      </FleetProvider>
    );

    // Should render table headers
    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Model / Make')).toBeInTheDocument();

    // Find search input
    const searchInput = screen.getByPlaceholderText('Search registration or model...');
    expect(searchInput).toBeInTheDocument();

    // Search for a specific registration
    fireEvent.change(searchInput, { target: { value: 'KA-01-EA-4821' } });

    // Should find the searched vehicle
    expect(screen.getByText('KA-01-EA-4821')).toBeInTheDocument();
  });

  it('filters by vehicle status dropdown', () => {
    render(
      <FleetProvider>
        <VehicleTable />
      </FleetProvider>
    );

    const statusDropdown = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusDropdown, { target: { value: 'maintenance' } });

    // Selected status should be reflected
    expect(statusDropdown).toHaveValue('maintenance');
  });
});
