// frontend/src/components/SubscriptionsPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SubscriptionsPage from './SubscriptionsPage'; // Adjust path
import { useAuth } from '../context/AuthContext';
import { vi } from 'vitest'; // Import vi

// Mock useAuth
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      token: 'fake-test-token',
      isAuthenticated: true,
    }),
  };
});

// Mock global fetch
global.fetch = vi.fn();
// Mock window.confirm
window.confirm = vi.fn();

const renderSubscriptionsPage = (initialEntries = ['/subscriptions']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/subscriptions/new" element={<div>Add New Subscription Page Mock</div>} />
        <Route path="/subscriptions/edit/:id" element={<div>Edit Subscription Page Mock for ID <span data-testid="edit-id">{':id'}</span></div>} />
      </Routes>
    </MemoryRouter>
  );
};

const mockSubscriptions = [
  { id: 1, userId: 1, name: 'Netflix', category: 'Streaming', billingCycle: 'Monthly', nextPaymentDate: '2024-08-01', amount: 15.99 },
  { id: 2, userId: 1, name: 'Spotify', category: 'Music', billingCycle: 'Yearly', nextPaymentDate: '2024-12-01', amount: 99.00 },
];

describe('SubscriptionsPage', () => {
  beforeEach(() => {
    global.fetch.mockReset();
    window.confirm.mockReset();
  });

  it('renders "No subscriptions found" when list is empty', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    renderSubscriptionsPage();
    expect(await screen.findByText('No subscriptions found. Add your first one!')).toBeInTheDocument();
  });

  it('renders a list of subscriptions correctly', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockSubscriptions });
    renderSubscriptionsPage();

    expect(await screen.findByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('Spotify')).toBeInTheDocument();
    expect(screen.getByText('$15.99')).toBeInTheDocument(); // Check amount formatting
    expect(screen.getByText(new Date('2024-12-01').toLocaleDateString())).toBeInTheDocument(); // Check date formatting
  });

  it('has a link to add a new subscription', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    renderSubscriptionsPage();
    const addButton = await screen.findByRole('link', { name: /add new subscription/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute('href', '/subscriptions/new');
  });

  it('has edit links for each subscription pointing to correct edit page', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockSubscriptions });
    renderSubscriptionsPage();
    const editLinks = await screen.findAllByRole('link', { name: /edit/i });
    expect(editLinks[0]).toHaveAttribute('href', '/subscriptions/edit/1');
    expect(editLinks[1]).toHaveAttribute('href', '/subscriptions/edit/2');
  });

  it('calls delete API and refetches on confirmed delete', async () => {
    const user = userEvent.setup();
    window.confirm.mockReturnValue(true); // User confirms deletion

    // Initial fetch
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockSubscriptions });
    // Fetch after delete (DELETE call itself)
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Subscription deleted' }) });
    // Refetch after successful delete
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [mockSubscriptions[1]] }); // Return only Spotify

    renderSubscriptionsPage();

    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]); // Click delete for Netflix

    expect(window.confirm).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/subscriptions/1', expect.objectContaining({ method: 'DELETE' }));
    });

    // Check that Netflix is gone and Spotify remains
    await waitFor(() => {
      expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
      expect(screen.getByText('Spotify')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledTimes(3); // Initial, Delete, Refetch
  });

  it('does not call delete API if delete is not confirmed', async () => {
    const user = userEvent.setup();
    window.confirm.mockReturnValue(false); // User cancels deletion
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockSubscriptions });
    renderSubscriptionsPage();

    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only initial fetch
    expect(screen.getByText('Netflix')).toBeInTheDocument(); // Still there
  });

  it('displays error message if fetching subscriptions fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API error fetching subs'));
    renderSubscriptionsPage();
    expect(await screen.findByText(/error fetching subscriptions: api error fetching subs/i)).toBeInTheDocument();
  });
});
