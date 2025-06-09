// frontend/src/components/Dashboard.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard'; // Adjust path
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

const renderDashboard = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Add other routes if Link clicks are fully tested, e.g. /subscriptions */}
        <Route path="/subscriptions" element={<div>Mock Subscriptions Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

const mockSubscriptionsData = [
  { id: 1, name: 'Netflix', category: 'Streaming', billingCycle: 'Monthly', nextPaymentDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(), amount: 10 }, // Payment this month
  { id: 2, name: 'Spotify', category: 'Music', billingCycle: 'Yearly', nextPaymentDate: '2025-01-01', amount: 120 }, // Yearly
  { id: 3, name: 'Gym', category: 'Health', billingCycle: 'Quarterly', nextPaymentDate: '2024-09-01', amount: 60 }, // Quarterly
];
// Expected calculations for mockSubscriptionsData:
// Monthly: Netflix (10) + Spotify (120/12=10) + Gym (60/3=20) = 40
// Yearly: Netflix (10*12=120) + Spotify (120) + Gym (60*4=240) = 480

describe('Dashboard', () => {
  beforeEach(() => {
    global.fetch.mockReset();
    // Reset date to a fixed point for consistent calendar tests if needed,
    // or ensure date logic in component is robust to current date.
    // For now, we'll rely on current date for calendar month, and mock data for payment dates.
  });

  it('renders main sections', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // Empty subs for this test
    renderDashboard();
    expect(await screen.findByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Payments')).toBeInTheDocument();
    expect(screen.getByText(/view all subscriptions on the/i)).toBeInTheDocument();
  });

  it('fetches subscriptions and displays correct summary costs', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockSubscriptionsData });
    renderDashboard();

    expect(await screen.findByText('$40.00')).toBeInTheDocument(); // Total Monthly
    expect(screen.getByText('$480.00')).toBeInTheDocument(); // Total Yearly
  });

  it('displays loading state initially for summary', () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {})); // Keep it pending
    renderDashboard();
    expect(screen.getByText(/loading summary.../i)).toBeInTheDocument();
  });

  it('displays error state for summary if fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API Error'));
    renderDashboard();
    expect(await screen.findByText(/error loading summary: api error/i)).toBeInTheDocument();
  });

  describe('Calendar Functionality', () => {
    const today = new Date();
    const currentMonthName = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();

    // A payment date within the current month for testing highlighting
    const paymentDayThisMonth = 15;
    const paymentDateInCurrentMonthISO = new Date(currentYear, today.getMonth(), paymentDayThisMonth).toISOString();
     const mockSubsWithCurrentMonthPayment = [
      { ...mockSubscriptionsData[0], nextPaymentDate: paymentDateInCurrentMonthISO },
    ];


    it('renders calendar with current month/year and navigation', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      renderDashboard();

      expect(await screen.findByText(`${currentMonthName} ${currentYear}`)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      // Check for weekday headers
      expect(screen.getByText('Sun')).toBeInTheDocument();
      // Check for at least some day cells (e.g., day 1)
      // Using a more robust selector for day cells if multiple '1's could exist
      const dayOneCells = screen.getAllByText('1').filter(el => el.closest('div.grid > div') && !el.closest('div.grid > div > div'));
      expect(dayOneCells.length).toBeGreaterThanOrEqual(1);
    });

    it('highlights payment dates on the calendar', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockSubsWithCurrentMonthPayment });
      renderDashboard();

      // Wait for calendar to render with the payment day
      const dayCellTextElement = await screen.findByText(paymentDayThisMonth.toString(), {selector: 'div.grid > div > div, div.grid > div'});
      expect(dayCellTextElement).toBeInTheDocument();

      // Assuming the highlighted cell contains a "Pay" span or has a specific class
      // For this example, we check if the cell containing the day number also contains "Pay"
      // The structure is: <div class="cell"><day_number_here/> <span class="text-xs">Pay</span></div>
      // So, check the parent of the day number text.
      const parentCell = dayCellTextElement.closest('div[class*="p-2 border"]'); // More specific selector for the cell
      expect(parentCell).toHaveTextContent('Pay');
      // Or, if a class is used: expect(parentCell).toHaveClass('bg-blue-500');
    });

    it('navigates calendar months with Prev/Next buttons', async () => {
      const user = userEvent.setup();
      global.fetch.mockResolvedValue({ ok: true, json: async () => [] }); // Continuous mock for refetches
      renderDashboard();

      const initialMonthDisplay = await screen.findByText(`${currentMonthName} ${currentYear}`);
      expect(initialMonthDisplay).toBeInTheDocument();

      // Click Next Month
      await user.click(screen.getByRole('button', { name: /next/i }));
      const nextMonthDate = new Date(currentYear, today.getMonth() + 1, 1);
      const nextMonthName = nextMonthDate.toLocaleString('default', { month: 'long' });
      const nextMonthYear = nextMonthDate.getFullYear();
      expect(await screen.findByText(`${nextMonthName} ${nextMonthYear}`)).toBeInTheDocument();

      // Click Prev Month twice to go back one month from original
      await user.click(screen.getByRole('button', { name: /prev/i })); // Back to current
      await user.click(screen.getByRole('button', { name: /prev/i })); // To previous
      const prevMonthDate = new Date(currentYear, today.getMonth() - 1, 1);
      const prevMonthName = prevMonthDate.toLocaleString('default', { month: 'long' });
      const prevMonthYear = prevMonthDate.getFullYear();
      expect(await screen.findByText(`${prevMonthName} ${prevMonthYear}`)).toBeInTheDocument();
    });
  });
});
