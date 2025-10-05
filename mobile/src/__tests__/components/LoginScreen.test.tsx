import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../screens/LoginScreen';
import { AuthProvider } from '../../context/AuthContext';

// Mock the auth context
const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    isLoading: false,
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    expect(getByPlaceholderText('Email Address')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('switches between login and register modes', () => {
    const { getByText, queryByPlaceholderText } = render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    // Initially in login mode
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(queryByPlaceholderText('Full Name')).toBeFalsy();

    // Switch to register mode
    fireEvent.press(getByText('Sign Up'));
    
    expect(getByText('Create Account')).toBeTruthy();
    expect(queryByPlaceholderText('Full Name')).toBeTruthy();
  });

  it('calls login function with correct parameters', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    const emailInput = getByPlaceholderText('Email Address');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows validation error for empty fields', () => {
    const { getByText } = render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    const loginButton = getByText('Sign In');
    fireEvent.press(loginButton);

    // Should show alert for empty fields
    expect(require('react-native/Libraries/Alert/Alert').alert).toHaveBeenCalledWith(
      'Error',
      'Please fill in all fields'
    );
  });

  it('toggles password visibility', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    const passwordInput = getByPlaceholderText('Password');
    
    // Initially password should be hidden
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});