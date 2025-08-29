import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../../screens/LoginScreen';
import { useAuthStore } from '../../store/authStore';

// Mock the auth store
jest.mock('../../store/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn()
};

describe('LoginScreen', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    });
  });

  it('renders login form', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('handles login submission', async () => {
    const mockLogin = jest.fn();
    mockUseAuthStore.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: jest.fn(),
      register: jest.fn()
    });

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows loading state', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    });

    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});