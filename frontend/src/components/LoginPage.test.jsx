// frontend/src/components/LoginPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage'; // Adjust path as necessary
import { AuthProvider, useAuth } from '../context/AuthContext'; // To mock useAuth
import { vi } from 'vitest'; // Import vi for mocks

// Mock useAuth
const mockLoginAction = vi.fn();
const mockNavigateForLoginPage = vi.fn(); // Specific mock for this test file

vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      loginAction: mockLoginAction,
      // Add other context values if LoginPage uses them, e.g. isAuthenticated
      isAuthenticated: false,
    }),
  };
});

// Mock react-router-dom's useNavigate
// This is needed because LoginPage itself calls useNavigate.
// We use a separate mock function here to avoid conflicts if other tests also mock useNavigate.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigateForLoginPage, // Use the specific mock for LoginPage
  };
});


// Mock global fetch
global.fetch = vi.fn();

const renderLoginPageWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Dashboard Mock</div>} /> {/* For successful navigation */}
      </Routes>
    </MemoryRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    mockLoginAction.mockClear();
    mockNavigateForLoginPage.mockClear();
    global.fetch.mockClear();
    // localStorage.clear(); // LoginPage should not use localStorage directly anymore due to AuthContext
  });

  it('renders login form correctly', () => {
    renderLoginPageWithRouter();
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  it('allows user to type into email and password fields', async () => {
    const user = userEvent.setup();
    renderLoginPageWithRouter();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput.value).toBe('test@example.com');

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'password123');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls loginAction and navigates on successful login', async () => {
    const user = userEvent.setup();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'fake-token', email: 'test@example.com', userId: 1 }),
    });

    renderLoginPageWithRouter();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.anything());
      expect(mockLoginAction).toHaveBeenCalledWith({ token: 'fake-token', email: 'test@example.com', userId: 1 });
      expect(mockNavigateForLoginPage).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message on failed login', async () => {
    const user = userEvent.setup();
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    renderLoginPageWithRouter();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    expect(mockLoginAction).not.toHaveBeenCalled();
    expect(mockNavigateForLoginPage).not.toHaveBeenCalled();
  });

  it('displays error message if fetch itself fails', async () => {
    const user = userEvent.setup();
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    renderLoginPageWithRouter();
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
