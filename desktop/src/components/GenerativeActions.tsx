import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  EnvelopeIcon, 
  ListBulletIcon, 
  LanguageIcon,
  PencilIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ContentTransformation, ClipboardItem } from '../../../shared/types';

interface GenerativeActionsProps {
  item: ClipboardItem;
  onTransformationApplied: (transformation: ContentTransformation) => void;
  onActionExecuted: (action: string, result: any) => void;
}

export function GenerativeActions({ item, onTransformationApplied, onActionExecuted }: GenerativeActionsProps) {
  const [transformations, setTransformations] = useState<ContentTransformation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item.content && item.content.length > 10) {
      generateTransformations();
    }
  }, [item]);

  const generateTransformations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generative/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: item.content,
          contentType: item.contentType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTransformations(data.data.transformations || []);
      }
    } catch (error) {
      console.error('Error generating transformations:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeGenerativeAction = async (action: string, params: any = {}) => {
    setActiveAction(action);
    try {
      let endpoint = '';
      let body = { content: item.content, ...params };

      switch (action) {
        case 'generate_email':
          endpoint = '/api/generative/email';
          break;
        case 'create_task_list':
          endpoint = '/api/generative/tasks';
          break;
        case 'translate':
          endpoint = '/api/generative/translate';
          body.targetLanguage = params.targetLanguage || 'Spanish';
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.data.email || data.data.taskList || data.data.translation || data.data;
        setGeneratedContent(prev => ({ ...prev, [action]: result }));
        onActionExecuted(action, result);
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
    } finally {
      setActiveAction(null);
    }
  };

  const applyTransformation = (transformation: ContentTransformation) => {
    onTransformationApplied(transformation);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const getTransformationIcon = (type: string) => {
    switch (type) {
      case 'summarize':
        return <ListBulletIcon className="h-4 w-4" />;
      case 'tone_change':
        return <PencilIcon className="h-4 w-4" />;
      case 'expand':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'grammar_fix':
        return <PencilIcon className="h-4 w-4" />;
      default:
        return <SparklesIcon className="h-4 w-4" />;
    }
  };

  const getTransformationTitle = (type: string) => {
    switch (type) {
      case 'summarize':
        return 'Summarize to Bullets';
      case 'tone_change':
        return 'Professional Tone';
      case 'expand':
        return 'Expand Idea';
      case 'grammar_fix':
        return 'Fix Grammar';
      default:
        return 'Transform';
    }
  };

  const shouldShowGenerativeActions = () => {
    const content = item.content.toLowerCase();
    return content.length > 50 && (
      content.includes('idea') || 
      content.includes('plan') || 
      content.includes('project') ||
      content.length > 100
    );
  };

  return (
    <div className="space-y-6">
      {/* Content Transformations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 flex items-center">
            <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
            Content Transformations
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateTransformations}
            disabled={loading}
            className="flex items-center"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : transformations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <SparklesIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No transformations available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {transformations.map((transformation) => (
              <div key={transformation.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getTransformationIcon(transformation.type)}
                    <span className="ml-2 font-medium text-gray-900 text-sm">
                      {getTransformationTitle(transformation.type)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(transformation.confidence * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                  {transformation.transformedContent}
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyTransformation(transformation)}
                  >
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(transformation.transformedContent)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generative Actions */}
      {shouldShowGenerativeActions() && (
        <div>
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <SparklesIcon className="h-5 w-5 text-blue-600 mr-2" />
            Generative Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Generate Email */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">Draft Email</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Create a professional email about this content
              </p>
              <Button
                size="sm"
                onClick={() => executeGenerativeAction('generate_email')}
                disabled={activeAction === 'generate_email'}
                className="w-full"
              >
                {activeAction === 'generate_email' ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Generate Email'
                )}
              </Button>
              {generatedContent.generate_email && (
                <div className="mt-3 p-3 bg-gray-50 rounded border">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {generatedContent.generate_email}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedContent.generate_email)}
                    className="mt-2"
                  >
                    Copy Email
                  </Button>
                </div>
              )}
            </div>

            {/* Create Task List */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ListBulletIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900">Create Tasks</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Break this down into actionable tasks
              </p>
              <Button
                size="sm"
                onClick={() => executeGenerativeAction('create_task_list')}
                disabled={activeAction === 'create_task_list'}
                className="w-full"
              >
                {activeAction === 'create_task_list' ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Create Task List'
                )}
              </Button>
              {generatedContent.create_task_list && (
                <div className="mt-3 p-3 bg-gray-50 rounded border">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {generatedContent.create_task_list}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedContent.create_task_list)}
                    className="mt-2"
                  >
                    Copy Tasks
                  </Button>
                </div>
              )}
            </div>

            {/* Translate */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <LanguageIcon className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Translate</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Translate to another language
              </p>
              <div className="space-y-2">
                <select className="w-full text-sm border border-gray-300 rounded px-2 py-1">
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                </select>
                <Button
                  size="sm"
                  onClick={() => executeGenerativeAction('translate', { targetLanguage: 'Spanish' })}
                  disabled={activeAction === 'translate'}
                  className="w-full"
                >
                  {activeAction === 'translate' ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Translate'
                  )}
                </Button>
              </div>
              {generatedContent.translate && (
                <div className="mt-3 p-3 bg-gray-50 rounded border">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {generatedContent.translate}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedContent.translate)}
                    className="mt-2"
                  >
                    Copy Translation
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}