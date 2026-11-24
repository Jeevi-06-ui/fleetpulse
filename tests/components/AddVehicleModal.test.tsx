import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FleetProvider } from '@/context/FleetContext';
import { AddVehicleModal } from '@/components/fleet/AddVehicleModal';

describe('Component: AddVehicleModal', () => {
  it('renders registration form and detects duplicate registration numbers', async () => {
    const handleClose = vi.fn();

    render(
      <FleetProvider>
        <AddVehicleModal isOpen={true} onClose={handleClose} />
      </FleetProvider>
    );

    expect(screen.getByText('Register New Fleet Vehicle')).toBeInTheDocument();

    const regInput = screen.getByPlaceholderText('e.g. KA-01-EA-4821');
    const nameInput = screen.getByPlaceholderText('e.g. Tata Signa 4825.TK');
    const makeInput = screen.getByPlaceholderText('e.g. Tata Motors, BharatBenz, Volvo');
    const form = screen.getByRole('dialog').querySelector('form')!;

    // Fill form with an existing registration KA-01-EA-4821
    fireEvent.change(regInput, { target: { value: 'KA-01-EA-4821' } });
    fireEvent.change(nameInput, { target: { value: 'Duplicate Test Truck' } });
    fireEvent.change(makeInput, { target: { value: 'Tata Motors' } });
    fireEvent.submit(form);

    // Duplicate error message must be shown
    expect(
      await screen.findByText(/already exists in the fleet registry/i)
    ).toBeInTheDocument();
  });
});
