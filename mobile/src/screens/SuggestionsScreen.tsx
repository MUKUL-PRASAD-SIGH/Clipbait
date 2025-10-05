import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useClipboard } from '../context/ClipboardContext';
import { ActionSuggestion } from '../types';

const SuggestionsScreen: React.FC = () => {
  const { selectedItem, suggestions, executeSuggestion } = useClipboard();
  const [testContent, setTestContent] = useState('');
  const [testSuggestions, setTestSuggestions] = useState<ActionSuggestion[]>([]);

  const handleSuggestionPress = async (suggestion: ActionSuggestion) => {
    try {
      await executeSuggestion(suggestion);
      
      // Handle different suggestion types
      switch (suggestion.type) {
        case 'open_url':
          if (suggestion.metadata.url) {
            await Linking.openURL(suggestion.metadata.url);
          }
          break;
        case 'send_email':
          if (suggestion.metadata.email) {
            await Linking.openURL(`mailto:${suggestion.metadata.email}`);
          }
          break;
        case 'call_phone':
          if (suggestion.metadata.phone) {
            await Linking.openURL(`tel:${suggestion.metadata.phone}`);
          }
          break;
        case 'open_maps':
          if (suggestion.metadata.address) {
            const encodedAddress = encodeURIComponent(suggestion.metadata.address);
            await Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
          }
          break;
        default:
          Alert.alert('Action Executed', suggestion.description);
      }
    } catch (error) {
      console.error('Failed to execute suggestion:', error);
      Alert.alert('Error', 'Failed to execute action');
    }
  };

  const testAI = async () => {
    if (!testContent.trim()) {
      Alert.alert('Error', 'Please enter some content to test');
      return;
    }

    // Generate mock suggestions for demo
    const mockSuggestions: ActionSuggestion[] = [];

    // Email detection
    if (testContent.includes('@')) {
      mockSuggestions.push({
        id: 'email_1',
        type: 'send_email',
        title: 'Send Email',
        description: 'Compose email to this address',
        icon: 'mail',
        confidence: 0.95,
        metadata: { email: testContent.match(/\S+@\S+\.\S+/)?.[0] || '' },
      });
    }

    // Phone detection
    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(testContent)) {
      mockSuggestions.push({
        id: 'phone_1',
        type: 'call_phone',
        title: 'Call Number',
        description: 'Call this phone number',
        icon: 'call',
        confidence: 0.9,
        metadata: { phone: testContent.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || '' },
      });
    }

    // URL detection
    if (testContent.includes('http') || testContent.includes('www.')) {
      mockSuggestions.push({
        id: 'url_1',
        type: 'open_url',
        title: 'Open Link',
        description: 'Open this URL in browser',
        icon: 'open-outline',
        confidence: 0.98,
        metadata: { url: testContent.match(/(https?:\/\/[^\s]+)/)?.[0] || testContent },
      });
    }

    // Address detection
    if (testContent.toLowerCase().includes('street') || testContent.toLowerCase().includes('avenue')) {
      mockSuggestions.push({
        id: 'address_1',
        type: 'open_maps',
        title: 'Open in Maps',
        description: 'Navigate to this location',
        icon: 'map',
        confidence: 0.85,
        metadata: { address: testContent },
      });
    }

    setTestSuggestions(mockSuggestions);
  };

  const renderSuggestion = ({ item }: { item: ActionSuggestion }) => {
    const getIconName = (iconName: string): string => {
      const iconMap: Record<string, string> = {
        'mail': 'mail',
        'call': 'call',
        'open-outline': 'open-outline',
        'map': 'map',
        'calendar': 'calendar',
        'person-add': 'person-add',
        'document': 'document',
      };
      return iconMap[iconName] || 'help-outline';
    };

    const getConfidenceColor = (confidence: number) => {
      if (confidence >= 0.9) return '#4CAF50';
      if (confidence >= 0.7) return '#FF9800';
      return '#F44336';
    };

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSuggestionPress(item)}
      >
        <View style={styles.suggestionIcon}>
          <Icon name={getIconName(item.icon)} size={24} color="#007AFF" />
        </View>
        <View style={styles.suggestionContent}>
          <Text style={styles.suggestionTitle}>{item.title}</Text>
          <Text style={styles.suggestionDescription}>{item.description}</Text>
        </View>
        <View style={styles.confidenceContainer}>
          <View 
            style={[
              styles.confidenceBadge, 
              { backgroundColor: getConfidenceColor(item.confidence) }
            ]}
          >
            <Text style={styles.confidenceText}>
              {Math.round(item.confidence * 100)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const allSuggestions = [...suggestions, ...testSuggestions];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 AI Suggestions</Text>
        {selectedItem && (
          <Text style={styles.headerSubtitle}>
            For: {selectedItem.content.substring(0, 50)}...
          </Text>
        )}
      </View>

      <View style={styles.testSection}>
        <Text style={styles.testTitle}>Test AI Processing</Text>
        <TextInput
          style={styles.testInput}
          placeholder="Enter content to test AI suggestions..."
          value={testContent}
          onChangeText={setTestContent}
          multiline
        />
        <TouchableOpacity style={styles.testButton} onPress={testAI}>
          <Text style={styles.testButtonText}>🧠 Analyze with AI</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allSuggestions}
        renderItem={renderSuggestion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bulb-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No suggestions available</Text>
            <Text style={styles.emptySubtext}>
              Select a clipboard item or test AI processing above
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  testSection: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  testInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  suggestionItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#666',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SuggestionsScreen;