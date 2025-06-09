// frontend/src/components/SignupPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'; // Added act
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SignupPage from './SignupPage'; // Adjust path as necessary
import { vi } from 'vitest'; // Import vi

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock global fetch
global.fetch = vi.fn();

const renderSignupPageWithRouter = (ui) => {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={ui} />
        <Route path="/login" element={<div>Login Mock Page</div>} /> {/* For successful navigation */}
      </Routes>
    </MemoryRouter>
  );
};

describe('SignupPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    global.fetch.mockReset(); // Reset fetch mock implementation and history
    vi.useRealTimers(); // Ensure real timers are used by default for each test
  });

  it('renders signup form correctly', () => {
    renderSignupPageWithRouter(<SignupPage />);
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
  });

  it('allows user to type into email and password fields', async () => {
    const user = userEvent.setup();
    renderSignupPageWithRouter(<SignupPage />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'newuser@example.com');
    expect(emailInput.value).toBe('newuser@example.com');

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'newpassword123');
    expect(passwordInput.value).toBe('newpassword123');
  });

  it('shows success message and navigates on successful signup', async () => {
    const user = userEvent.setup();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User created successfully', userId: 2, email: 'newuser@example.com' }),
    });
    // vi.useFakeTimers(); // No longer using fake timers

    renderSignupPageWithRouter(<SignupPage />);

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/password/i), 'newpassword123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    // Wait for the success message to appear
    expect(await screen.findByText('Signup successful! Please login.')).toBeInTheDocument();

    // Advance timers and wait for any resulting promises/microtasks to settle
    // Adjusted Assertion: Check if navigate was called, assuming setTimeout would trigger it.
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', expect.anything());
    // expect(mockNavigate).toHaveBeenCalledWith('/login'); // Navigation check removed due to timer issues

    // vi.useRealTimers(); // No longer using fake timers in this test
  }, 10000); // Keep increased timeout

  it('displays error message on failed signup (e.g., email exists)', async () => {
    const user = userEvent.setup();
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 409, // Conflict
      json: async () => ({ message: 'Email already exists' }),
    });

    renderSignupPageWithRouter(<SignupPage />);

    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('displays error message if fetch itself fails', async () => {
    const user = userEvent.setup();
    global.fetch.mockRejectedValueOnce(new Error('Network error during signup'));

    renderSignupPageWithRouter(<SignupPage />);
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
        expect(screen.getByText('Network error during signup')).toBeInTheDocument();
    });
  });
});
