// frontend/src/context/AuthContext.test.jsx
import React from 'react';
import { render, act, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext'; // Adjust path as necessary
import { MemoryRouter, Routes, Route } from 'react-router-dom'; // For useNavigate mock

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock useNavigate
import { vi } from 'vitest'; // Import vi
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const originalModule = await vi.importActual('react-router-dom'); // Use vi.importActual
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

// Test component to consume context
const TestConsumer = () => {
  const { token, user, isAuthenticated, loginAction, logoutAction } = useAuth();
  return (
    <div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="token">{token || ''}</div> {/* Ensure textContent is not null */}
      <div data-testid="userEmail">{user?.email || ''}</div> {/* Ensure textContent is not null */}
      <button onClick={() => loginAction({ token: 'test-token', email: 'test@example.com', userId: 1 })}>Login</button>
      <button onClick={logoutAction}>Logout</button>
    </div>
  );
};

// Wrapper for tests needing router context for useNavigate
const renderWithRouter = (ui) => {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="*" element={ui} />
            </Routes>
        </MemoryRouter>
    );
};


describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockNavigate.mockClear();
    // Vitest/Jest automatically clears mocks if clearMocks is true in config,
    // but explicit clearing of localStorage and navigate is good for clarity.
  });

  it('initial state is not authenticated', () => {
    renderWithRouter(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    expect(screen.getByTestId('token').textContent).toBe('');
    expect(screen.getByTestId('userEmail').textContent).toBe('');
  });

  it('loginAction updates context and localStorage', () => {
    renderWithRouter(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('Login'));
    });
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    expect(screen.getByTestId('token').textContent).toBe('test-token');
    expect(screen.getByTestId('userEmail').textContent).toBe('test@example.com');
    expect(localStorageMock.getItem('token')).toBe('test-token');
    expect(JSON.parse(localStorageMock.getItem('user')).email).toBe('test@example.com');
  });

  it('logoutAction clears context, localStorage and navigates to /login', () => {
    // Setup initial logged-in state
    localStorageMock.setItem('token', 'initial-token');
    localStorageMock.setItem('user', JSON.stringify({ email: 'initial@example.com', userId: 2 }));

    renderWithRouter(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Verify initial logged-in state from localStorage
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    expect(screen.getByTestId('token').textContent).toBe('initial-token');

    act(() => {
      fireEvent.click(screen.getByText('Logout'));
    });

    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    expect(screen.getByTestId('token').textContent).toBe('');
    expect(screen.getByTestId('userEmail').textContent).toBe('');
    expect(localStorageMock.getItem('token')).toBeNull();
    expect(localStorageMock.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('initializes from localStorage if token and user exist', () => {
    localStorageMock.setItem('token', 'stored-token');
    localStorageMock.setItem('user', JSON.stringify({ email: 'stored@example.com', userId: 3 }));

    renderWithRouter(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    expect(screen.getByTestId('token').textContent).toBe('stored-token');
    expect(screen.getByTestId('userEmail').textContent).toBe('stored@example.com');
  });
});
