// frontend/src/components/ProtectedRoute.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute'; // Adjust path
import { useAuth } from '../context/AuthContext';
import { vi } from 'vitest'; // Import vi

// Mock useAuth
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(), // Will be overridden by mockReturnValue in tests
  };
});

// Mock child components for testing Outlet
const MockChildComponent = () => <div data-testid="child-component">Protected Content</div>;
const MockLoginPage = () => <div data-testid="login-page">Login Page</div>;


describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    // useAuth.mockReset(); // This is incorrect for vi.fn(). Instead, clear the mock function itself.
    vi.mocked(useAuth).mockReset();
  });

  it('renders child component when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<MockChildComponent />} />
          </Route>
          <Route path="/login" element={<MockLoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<MockChildComponent />} />
          </Route>
          <Route path="/login" element={<MockLoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    // After redirection, Login Page should be visible
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
  });
});
