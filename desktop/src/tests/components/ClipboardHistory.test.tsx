import { render, screen, waitFor } from '@testing-library/react';
import { ClipboardHistory } from '../components/ClipboardHistory';
import { useClipboardStore } from '../store/clipboardStore';

// Mock the store
jest.mock('../store/clipboardStore');
const mockUseClipboardStore = useClipboardStore as jest.MockedFunction<typeof useClipboardStore>;

describe('ClipboardHistory Component', () => {
  const mockItems = [
    {
      id: '1',
      content: 'Test content 1',
      type: 'text' as const,
      timestamp: new Date('2024-01-01'),
      source: 'manual'
    },
    {
      id: '2',
      content: 'Test content 2',
      type: 'text' as const,
      timestamp: new Date('2024-01-02'),
      source: 'manual'
    }
  ];

  beforeEach(() => {
    mockUseClipboardStore.mockReturnValue({
      items: mockItems,
      loading: false,
      error: null,
      fetchItems: jest.fn(),
      addItem: jest.fn(),
      deleteItem: jest.fn(),
      clearHistory: jest.fn()
    });
  });

  it('renders clipboard items', async () => {
    render(<ClipboardHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('Test content 1')).toBeInTheDocument();
      expect(screen.getByText('Test content 2')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    mockUseClipboardStore.mockReturnValue({
      items: [],
      loading: true,
      error: null,
      fetchItems: jest.fn(),
      addItem: jest.fn(),
      deleteItem: jest.fn(),
      clearHistory: jest.fn()
    });

    render(<ClipboardHistory />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseClipboardStore.mockReturnValue({
      items: [],
      loading: false,
      error: 'Failed to load items',
      fetchItems: jest.fn(),
      addItem: jest.fn(),
      deleteItem: jest.fn(),
      clearHistory: jest.fn()
    });

    render(<ClipboardHistory />);
    expect(screen.getByText('Failed to load items')).toBeInTheDocument();
  });
});