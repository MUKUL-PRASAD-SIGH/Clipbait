import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import { useClipboardStore } from '../store/clipboardStore';
import { apiService } from '../services/api';
import { LoadingSpinner, LoadingState } from './ui/LoadingSpinner';
import ClipboardService from '../services/clipboardService';
import toast from 'react-hot-toast';

interface ClipboardTestPanelProps {
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  defaultExpanded?: boolean;
}

interface TestSample {
  id: string;
  label: string;
  content: string;
  category: 'contact' | 'url' | 'code' | 'address' | 'mixed' | 'date';
  icon: string;
  expectedEntities?: string[];
}

export const ClipboardTestPanel: React.FC<ClipboardTestPanelProps> = ({ 
  onClose, 
  position = 'top-right',
  defaultExpanded = true 
}) => {
  const [testContent, setTestContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [aiServiceHealth, setAiServiceHealth] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown');
  const { addClipboardItem } = useClipboardStore();

  const testSamples: TestSample[] = [
    {
      id: 'contact-1',
      label: 'Contact Info',
      content: "Call me at +1-555-123-4567 or email john.doe@example.com",
      category: 'contact',
      icon: '👤',
      expectedEntities: ['phone', 'email']
    },
    {
      id: 'contact-2',
      label: 'Business Card',
      content: "John Smith\nSenior Developer\nAcme Corp\nphone: (555) 987-6543\nemail: j.smith@acmecorp.com",
      category: 'contact',
      icon: '💼',
      expectedEntities: ['phone', 'email', 'name', 'company']
    },
    {
      id: 'url-1',
      label: 'GitHub Project',
      content: "Check out this cool project: https://github.com/user/awesome-project",
      category: 'url',
      icon: '🔗',
      expectedEntities: ['url']
    },
    {
      id: 'url-2',
      label: 'Multiple URLs',
      content: "Visit our website at https://example.com and our docs at https://docs.example.com/api",
      category: 'url',
      icon: '🌐',
      expectedEntities: ['url']
    },
    {
      id: 'code-1',
      label: 'JavaScript Function',
      content: "function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }",
      category: 'code',
      icon: '💻',
      expectedEntities: ['code']
    },
    {
      id: 'code-2',
      label: 'Python Code',
      content: "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
      category: 'code',
      icon: '🐍',
      expectedEntities: ['code']
    },
    {
      id: 'address-1',
      label: 'Meeting Location',
      content: "Meeting tomorrow at 3 PM at 123 Main Street, New York, NY 10001",
      category: 'address',
      icon: '📍',
      expectedEntities: ['address', 'date', 'time']
    },
    {
      id: 'date-1',
      label: 'Event Details',
      content: "Conference on December 15, 2024 from 9:00 AM to 5:00 PM at Convention Center",
      category: 'date',
      icon: '📅',
      expectedEntities: ['date', 'time', 'location']
    },
    {
      id: 'mixed-1',
      label: 'Complex Content',
      content: "Hi! I'm Sarah (sarah@company.com). Let's meet at 456 Oak Ave on Friday at 2 PM. Call me at +1-555-0123 if you need directions. Here's the project link: https://github.com/team/project",
      category: 'mixed',
      icon: '🎯',
      expectedEntities: ['email', 'phone', 'address', 'url', 'date', 'time']
    }
  ];

  const categories = [
    { id: 'all', label: 'All Samples', icon: '📋' },
    { id: 'contact', label: 'Contact Info', icon: '👤' },
    { id: 'url', label: 'URLs & Links', icon: '🔗' },
    { id: 'code', label: 'Code Snippets', icon: '💻' },
    { id: 'address', label: 'Addresses', icon: '📍' },
    { id: 'date', label: 'Dates & Events', icon: '📅' },
    { id: 'mixed', label: 'Mixed Content', icon: '🎯' }
  ];

  const filteredSamples = selectedCategory === 'all' 
    ? testSamples 
    : testSamples.filter(sample => sample.category === selectedCategory);

  // Check AI service health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await apiService.ai.checkHealth();
        setAiServiceHealth(health.status === 'healthy' ? 'healthy' : 'unhealthy');
      } catch {
        setAiServiceHealth('unhealthy');
      }
    };
    
    checkHealth();
  }, []);

  const handleTestContent = async (content: string, sample?: TestSample) => {
    setTestContent(content);
    setIsProcessing(true);
    setAiResults(null);

    try {
      // Add to clipboard store
      addClipboardItem(content);
      
      // Test AI processing with enhanced error handling
      const result = await apiService.ai.processContent(content);
      setAiResults(result);
      
      const message = result.fallback 
        ? 'AI service unavailable - using fallback analysis' 
        : 'AI analysis complete!';
      
      toast.success(message, {
        icon: result.fallback ? '⚠️' : '🤖',
        duration: 3000
      });

      // Log expected vs actual entities for testing
      if (sample?.expectedEntities) {
        const detectedTypes = result.entities?.map((e: any) => e.type) || [];
        const missing = sample.expectedEntities.filter(type => !detectedTypes.includes(type));
        if (missing.length > 0) {
          console.warn(`Missing expected entities for ${sample.label}:`, missing);
        }
      }
      
    } catch (error) {
      console.error('AI processing failed:', error);
      const errorMessage = apiService.utils.getErrorMessage(error);
      toast.error(`AI processing failed: ${errorMessage}`);
      setAiResults(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeAction = async (action: any) => {
    try {
      switch (action.type) {
        case 'open_url':
          if (action.metadata?.url) {
            window.open(action.metadata.url, '_blank');
            toast.success('URL opened in new tab!', { icon: '🔗' });
          }
          break;
          
        case 'send_email':
          if (action.metadata?.email) {
            window.open(`mailto:${action.metadata.email}`, '_blank');
            toast.success('Email client opened!', { icon: '📧' });
          }
          break;
          
        case 'call_phone':
          if (action.metadata?.phone) {
            window.open(`tel:${action.metadata.phone}`, '_blank');
            toast.success('Phone dialer opened!', { icon: '📞' });
          }
          break;
          
        case 'copy':
          try {
            await ClipboardService.setClipboard(testContent);
            toast.success('Copied to system clipboard!', { icon: '📋' });
          } catch (error) {
            // Fallback to web clipboard
            await navigator.clipboard.writeText(testContent);
            toast.success('Copied to clipboard!', { icon: '📋' });
          }
          break;
          
        default:
          toast.success(`Action executed: ${action.title}`, { icon: '⚡' });
      }
    } catch (error) {
      console.error('Action execution failed:', error);
      toast.error('Action failed to execute');
    }
  };

  const clearResults = () => {
    setAiResults(null);
    setTestContent('');
  };

  const getHealthStatusColor = () => {
    switch (aiServiceHealth) {
      case 'healthy': return 'text-green-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getHealthStatusIcon = () => {
    switch (aiServiceHealth) {
      case 'healthy': return '🟢';
      case 'unhealthy': return '🔴';
      default: return '⚪';
    }
  };

  if (!isExpanded) {
    return (
      <Card 
        variant="glass" 
        className="w-12 h-12 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center justify-center h-full">
          <span className="text-xl">🧪</span>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      variant="glass" 
      className="w-[420px] max-h-[600px] overflow-hidden shadow-2xl border-2 border-blue-200/50 animate-fade-in-up"
    >
      <CardHeader bordered className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle size="sm" className="flex items-center gap-2">
              🧪 AI Test Panel
              <span className={`text-xs ${getHealthStatusColor()}`}>
                {getHealthStatusIcon()}
              </span>
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Test AI processing with sample content
            </p>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon-sm"
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ➖
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
        {/* Category Filter */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Content Categories:</p>
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="xs"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs"
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Test Samples */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">
            Quick Test Samples ({filteredSamples.length}):
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filteredSamples.map((sample) => (
              <Button
                key={sample.id}
                variant="outline"
                size="sm"
                onClick={() => handleTestContent(sample.content, sample)}
                disabled={isProcessing}
                className="w-full text-left justify-start p-2 h-auto hover:bg-blue-50"
              >
                <div className="flex items-start gap-2 w-full">
                  <span className="text-sm flex-shrink-0">{sample.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs text-gray-800">{sample.label}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {sample.content.substring(0, 50)}...
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* System Clipboard Test */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">System Clipboard:</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const content = await ClipboardService.getCurrentClipboard();
                  if (content) {
                    setTestContent(content);
                    toast.success('Loaded from system clipboard!', { icon: '📋' });
                  } else {
                    toast.error('System clipboard is empty');
                  }
                } catch (error) {
                  console.error('Failed to read system clipboard:', error);
                  toast.error('Failed to read system clipboard');
                }
              }}
              className="flex-1"
            >
              📋 Read Current
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await ClipboardService.setClipboard('Test content from Epitychia! 🚀');
                  toast.success('Test content set to clipboard!', { icon: '✅' });
                } catch (error) {
                  console.error('Failed to set clipboard:', error);
                  toast.error('Failed to set clipboard');
                }
              }}
              className="flex-1"
            >
              ✅ Write Test
            </Button>
          </div>
        </div>

        {/* Manual Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-medium text-gray-600">Custom Content:</p>
            {testContent && (
              <Button
                variant="ghost"
                size="xs"
                onClick={clearResults}
                className="text-gray-400 hover:text-gray-600"
              >
                Clear
              </Button>
            )}
          </div>
          <textarea
            value={testContent}
            onChange={(e) => setTestContent(e.target.value)}
            placeholder="Paste any content here to test AI analysis..."
            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows={3}
          />
          <Button
            onClick={() => handleTestContent(testContent)}
            disabled={!testContent.trim() || isProcessing}
            loading={isProcessing}
            loadingText="Analyzing..."
            className="w-full mt-2"
            size="sm"
            variant="gradient"
          >
            🤖 Analyze with AI
          </Button>
        </div>

        {/* AI Results */}
        <LoadingState loading={isProcessing} fallback={
          <div className="text-center py-4">
            <LoadingSpinner size="lg" variant="primary" />
            <p className="text-sm text-gray-600 mt-2">Processing content...</p>
          </div>
        }>
          {aiResults && (
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-700">AI Analysis Results:</p>
                {aiResults.fallback && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Fallback Mode
                  </span>
                )}
              </div>

              {/* Suggestions */}
              {aiResults.suggestions?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">Suggested Actions:</p>
                  <div className="space-y-2">
                    {aiResults.suggestions.map((suggestion: any, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => executeAction(suggestion)}
                        className="w-full text-left justify-start hover:bg-green-50 hover:border-green-200"
                      >
                        <span className="mr-2 text-base">{suggestion.icon || '⚡'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{suggestion.title}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {suggestion.description}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 ml-2">
                          {Math.round(suggestion.confidence * 100)}%
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Detected Entities */}
              {aiResults.entities?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">Detected Entities:</p>
                  <div className="flex flex-wrap gap-1">
                    {aiResults.entities.map((entity: any, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        title={`Confidence: ${Math.round(entity.confidence * 100)}%`}
                      >
                        <span className="font-medium">{entity.type}</span>
                        <span className="ml-1 text-blue-600">
                          {entity.value.length > 15 
                            ? `${entity.value.substring(0, 15)}...` 
                            : entity.value
                          }
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Metadata */}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Category: {aiResults.category || 'unknown'}</span>
                  <span>Confidence: {Math.round((aiResults.confidence || 0) * 100)}%</span>
                </div>
              </div>
            </div>
          )}
        </LoadingState>
      </CardContent>
    </Card>
  );
};